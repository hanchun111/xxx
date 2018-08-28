package com.bosssoft.cloud.xxx.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.shiro.SecurityUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bosssoft.platform.runtime.spi.User;
import com.bosssoft.platform.shiro.token.TokenManager;

@Controller
@RequestMapping("u")
public class LoginController {

	
	/**
	 * 登录提交
	 * @param username 用户名
	 * @param password 密码
	 * @param rememberMe 是否记住
	 * @param request HTTP请求
	 * @return
	 */
	@RequestMapping(value="submitLogin",method=RequestMethod.POST)
	@ResponseBody
	public Map<String,Object> submitLogin(String ciphername,String ciphercode,HttpServletRequest request){
		//解决shiro会话标识未更新问题
		SecurityUtils.getSubject().logout();
		
		Map<String, Object> resultMap = new LinkedHashMap<String, Object>();
	
		try {
			Boolean rememberMe=false;			
			User user= TokenManager.login(ciphername,ciphercode,rememberMe,request);
			    
			resultMap.put("user",user);
			resultMap.put("status", 200);
			resultMap.put("message", "登录成功.");
			String url = request.getContextPath() + "/main.do";
			//跳转地址
			resultMap.put("back_url", url);			
		}catch(Exception e){
			e.printStackTrace();
			resultMap.put("status", 300);
			resultMap.put("message", "用户名或者密码错误.");
		}


		return resultMap;
	}
		
}
