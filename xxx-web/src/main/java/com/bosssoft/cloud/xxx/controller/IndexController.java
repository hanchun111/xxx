package com.bosssoft.cloud.xxx.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import com.bosssoft.platform.runtime.spi.configuration.ConfigurationConstants;
import com.bosssoft.platform.runtime.spi.configuration.PropertiesUtil;

@Controller
@RequestMapping("")
public class IndexController {
	
	@RequestMapping(value="login.do")
	public String login(){
		return "login";
	}


    @RequestMapping(value = "main.do")
	public String main(Model model){		
    	String appName=PropertiesUtil.getProperty(ConfigurationConstants.APPLICATION_ID);
		model.addAttribute("default");
    	model.addAttribute("homePage", "portal.do");
    	model.addAttribute("navmenus",null);    	
    	return "/mainframe/main";
	}
   
}
