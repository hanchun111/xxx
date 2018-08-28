package com.bosssoft.cloud.xxx.internal.shiro;

import com.bosssoft.platform.runtime.spi.DefaultUser;
import com.bosssoft.platform.runtime.spi.User;
import com.bosssoft.platform.shiro.spi.LoginAuthenticationHandler;

public class LoginAuthenticationHandlerImpl implements LoginAuthenticationHandler{

	@Override
	public User login(String userCode, String password){
		DefaultUser user=new DefaultUser();
		user.setUserCode(userCode);
		user.setUserName("测试用户");
		return user;
	}

	@Override
	public User loginByCAS(String userCode) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public User loginByCertificate(String identity){
		// TODO Auto-generated method stub
		return null;
	}

}
