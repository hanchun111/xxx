package com.bosssoft.cloud.xxx.utils;

import java.util.ArrayList;
import java.util.List;

import com.bosssoft.cloud.xxx.entity.ApiMenu;
import com.bosssoft.platform.shiro.token.TokenManager;

public class MenuUtils {

	/**
	 * 获取当前用户在当前应用下的菜单
	 * @return
	 */
	public static List<ApiMenu> getCurrentUserAndCurrentApplicationMenus(){
		//String userCode=TokenManager.getToken().getUserCode();
		
		List<ApiMenu> menus=new ArrayList<ApiMenu>();
		ApiMenu menu=new ApiMenu();
		menu.setAppId("00");
		menu.setFuncCode("F001");
		menu.setMenuCode("M001");
		menu.setIsLeaf("1");
		menu.setMenuName("测试菜单");
		menu.setMenuId("M001");
		menu.setMenuLevel(1);
		menu.setMenuUrl("user/list.do");
		menu.setSortNo(1);
		
		menus.add(menu);



		return menus;
	}
	
}
