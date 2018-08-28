package com.bosssoft.cloud.xxx.internal.shiro;

import java.util.List;
import java.util.Set;

import com.bosssoft.platform.runtime.spi.User;
import com.bosssoft.platform.shiro.spi.Function;
import com.bosssoft.platform.shiro.spi.PageElement;
import com.bosssoft.platform.shiro.spi.PermissionAuthenticationHandler;

public class PermissionAuthenticationHandlerImpl implements PermissionAuthenticationHandler{

	@Override
	public boolean enabled() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public Set<String> findPublicPermssions() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Set<Function> findPrivatePermissions() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Set<String> findUserPermissions(String userCode) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<PageElement> findUserAuthorizedPageResources(User user, String funcCode) {
		// TODO Auto-generated method stub
		return null;
	}

}
