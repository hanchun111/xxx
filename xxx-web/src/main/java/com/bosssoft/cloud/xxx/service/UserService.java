package com.bosssoft.cloud.xxx.service;

import java.util.List;

import com.bosssoft.cloud.xxx.entity.User;

public interface UserService {
	
	public User selectByPrimaryKey(String username);
	
	public List<User> listUsers();
	
	public int deleteByPrimayKey(String username);
	
	public int updateUser(User user);
	
	public int insertUser(User user);

	public boolean isExistUserCode(String userCode);

	public User getUserByUserCode(String userCode);
	
}
