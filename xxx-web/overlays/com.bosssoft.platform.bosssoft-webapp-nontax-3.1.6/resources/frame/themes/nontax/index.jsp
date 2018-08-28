<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>


<link
	href="<%=request.getContextPath()%>/resources/frame/themes/nontax/css/index.css"
	rel="stylesheet" type="text/css" />
<link
	href="<%=request.getContextPath()%>/resources/frame/themes/nontax/css/font-icon.css"
	rel="stylesheet" type="text/css" />
	
<link
	href="<%=request.getContextPath()%>/resources/frame/themes/nontax/skins/default/skins.css?v=201604201034"
	rel="stylesheet" type="text/css" />
	<link
	href="<%=request.getContextPath()%>/resources/frame/themes/nontax/skins/default/ui.css?v=201604201034"
	rel="stylesheet" type="text/css" />
<link href="<%=request.getContextPath()%>/resources/frame/css/font-icon.css"
	rel="stylesheet" type="text/css" />

<body class='hold-transition skin-blue sidebar-mini' style="overflow:hidden;">
 <div class="wrapper">
        <!--头部信息-->
        <div class="main-header">
            <div class="logo">
            </div>
            <div class="navbar navbar-static-top">
             <div class="navbar-custom-menu">
                    <ul class="nav navbar-nav">
                       
                        <li class="dropdown user user-menu">
                            <a title="用户信息">
                                <i class="icon-user" style=" margin-right:10px;"></i>
                                 <span id="userCode" class="hidden-xs"></span>
                               
                            </a>
                        </li>
                        
                       <li class="dropdown" id="bnt_orgList">  
                        <a class="dropdown-toggle" data-toggle="dropdown" >
                       	<i class="icon-org"></i>
                     	 [<span id="orgName"></span>]
                        <i class="icon-caret-down" style="float:right; font-size:12px;"></i>
                       
                        
                        
                        </a>
                        
                         <ul id="orgList"></ul>
                       </li>                    
                          <li class="dropdown">
                            <a id="btn_passwrod"  title="密码修改">
                                <i class="icon-password"></i>
                                 <span class="" style="margin-left:4px; ">密码修改</span>
                                
                            </a>
                          
                        </li>
                        
                        
                        
                          <li class="dropdown">
                            <a  id="btn_logout" class="dropdown-toggle" title="安全退出">
                                <i class="icon-tuichufffpx"></i>
                            </a>
                           
                         </li>
                    </ul>
                </div>
            </div>
        </div>
			<div class="main-sidebar">
			
            <div class="sidebar-header ">
                   <ul class="sf-menu sidebar-menu sidebar-favorite-menu sf-vertical ">
                  	<li id="btn_favoriteMenu">
                     <a>
                         <i class="icon-xialacaidan"></i>
                          <span>常用菜单</span>
                     </a>
                     
                     <ul id="favoriteMenuList" class="favorite-menu-list  ">
                     
                     </ul>
                 
                 </li>
                   </ul>
           </div>
		    <div class="sidebar"  id="sidebar-menu" >
		    	
				<ul class="sidebar-menu sf-menu sf-vertical" id="sidebarmenu" >
				
				</ul>
		   </div>
	</div>
	<!--中间内容-->
	<div id="content-wrapper" class="content-wrapper">
		<div class="content-tabs">
			<button class="roll-nav roll-left tabLeft">
				<i class="icon-mediaskipbackward"></i>
			</button>	  
			<nav class="page-tabs menuTabs">
				<div class="page-tabs-content" style="margin-left: 0px;">
                        
                       
				</div>
			</nav>
			<button class="roll-nav roll-right tabRight">
				<i class="icon-mediaskipforward" style="margin-left: 3px;"></i>
			</button>
			<div class="btn-group roll-nav roll-right">
				<button class="dropdown tabClose" data-toggle="dropdown">
					页签操作<i class="icon-caret-down " ></i>
				</button>
				<ul class="dropdown-menu dropdown-menu-right">
					<li><a class="tabReload">刷新当前</a></li>
					<li><a class="tabCloseCurrent">关闭当前</a></li>
					<li><a class="tabCloseAll" >全部关闭</a></li>
					<li><a class="tabCloseOther">除此之外全部关闭</a></li>
				</ul>
			</div>
			<!--<button class="roll-nav roll-right fullscreen">
				<i class="icon-fullscreen"></i>
			</button>
			-->
		</div>
		<div class="content-iframe" style="overflow: hidden;">
			
			<div class="main-content" id="content-main">
				
			</div>
		</div>
	</div>
	</div>
</body>


