package com.bosssoft.cloud.xxx.service.impl;

import java.util.List;

import com.bosssoft.cloud.xxx.entity.User;
import com.bosssoft.cloud.xxx.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bosssoft.cloud.xxx.mapper.UserMapper;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserServiceImpl implements UserService {
	@Autowired
	private UserMapper userMapper;
	
	@Override
	public User selectByPrimaryKey(String username) {
		return userMapper.selectByPrimaryKey(username);
	}

	@Override
	public List<User> listUsers() {
		return userMapper.selectAll();
	}

	@Override
	public int deleteByPrimayKey(String username) {
		userMapper.deleteByPrimaryKey(username);
		return 0;
	}

	@Override
	public int updateUser(User user) {
		userMapper.updateByPrimaryKeySelective(user);
		return 0;
	}

	@Override
	public int insertUser(User user) {
		userMapper.insert(user);
		return 0;
	}

	@Override
	public boolean isExistUserCode(String userCode){
		String u = userCode;
 		int num = 0;
		if(userCode != null || !"".equals(userCode))
		num = userMapper.selectByUserCode(userCode);
		if(num >=1)
			return true;
		return false;
	}

	@Override
	public User getUserByUserCode(String userCode){
		return userMapper.selectUserByUserCode(userCode);
	}

}
