package com.bosssoft.cloud.xxx.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.bosssoft.cloud.xxx.entity.User;
import com.bosssoft.cloud.xxx.service.UserService;
import freemarker.ext.beans.HashAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;
import com.bosssoft.platform.runtime.exception.BusinessException;
@Controller
@RequestMapping(value="/user")
public class UserController {
	@Autowired
	private UserService userService;
	/**
	 * 测试控制器是否能访问到
	 */
	@RequestMapping(value="/test.do")
	@ResponseBody
	public void Test(){
		throw new BusinessException("错误信息测试！");
	}
	/**
	 * 新增用户
	 * @param user
	 * @return
	 */
	@RequestMapping(value="/add.do")
	@ResponseBody
	public JSONObject addUser(User user){
		JSONObject jsonObject=new JSONObject();
		try {
			userService.insertUser(user);
			jsonObject.put("message", "新增成功");
		} catch (Exception e) {
			// TODO: handle exception
			jsonObject.put("message", "新增失败");
			e.printStackTrace();
		}
		return jsonObject;
	}
	/**
	 * 删除用户
	 * @param username
	 * @return
	 */
	@RequestMapping(value="/delete.do")
	@ResponseBody
	public JSONObject deleteUser(String username){
		JSONObject jsonObject=new JSONObject();
		try{
			userService.deleteByPrimayKey(username);
			jsonObject.put("message", "删除成功");
		}catch(Exception e){
			jsonObject.put("message", "删除失败");
			e.printStackTrace();
		}
		return jsonObject;
	}
	/**
	 * 修改用户
	 * @param user
	 * @return
	 */
	@RequestMapping(value="/update.do")
	@ResponseBody
	public JSONObject updateUser(User user){
		JSONObject jsonObject=new JSONObject();
		try {
			userService.updateUser(user);
			jsonObject.put("message", "修改成功");
		} catch (Exception e) {
			// TODO: handle exception
			jsonObject.put("message", "修改失败");
			e.printStackTrace();
		}
		return jsonObject;
	}
	/**
	 * 查询单个用户
	 * @param username
	 * @return
	 */
	@RequestMapping(value="/getUser.do")
	@ResponseBody
	public JSONObject getUser(String username){
		JSONObject jsonObject=new JSONObject();
		try {
			User user=userService.selectByPrimaryKey(username);
			jsonObject.put("data", user);
			jsonObject.put("message", "查询成功");
		} catch (Exception e) {
			// TODO: handle exception
			jsonObject.put("message", "查询失败");
			e.printStackTrace();
		}
		return jsonObject;
	}

	/**
	 * 通过userCode查找USER
	 *
	 *
	 * */
	@RequestMapping(value = "/getUserByUserCode.do")
	@ResponseBody
	public JSONObject getUserByUserCode(String userCode){
		JSONObject jsonObject = new JSONObject();
		try{
			User user = userService.getUserByUserCode(userCode);
			jsonObject.put("data",user);
			jsonObject.put("message","查询成功");
		}catch (Exception e){
			e.printStackTrace();
			jsonObject.put("message","查询失败");
		}
		return jsonObject;
	}
	/**
	 * 查询所有用户
	 * @return
	 */
	@RequestMapping(value="/list.do")
	public String listUsers(){
		return "xxx/demo/user_index.ui";
	}

	@RequestMapping("queryUserPage")
    @ResponseBody
	public Object queryUserPage(){
		List<Map<String, String>> result = new ArrayList<>();


		List<User> users= userService.listUsers();

		for(int i=0; i< users.size(); i++) {
			Map<String, String> u = new HashMap<>();
			u.put("userName", users.get(i).getUserName());
			u.put("userCode", users.get(i).getUserCode());
			if(users.get(i).getIdentityCode() == null || "".equals(users.get(i).getIdentityCode()) || users.get(i).getIdentityCode().length() != 18)
				u.put("identityCode",users.get(i).getIdentityCode());
			else
				u.put("identityCode",  users.get(i).getIdentityCode().replaceAll("(\\d{6})\\d{8}(\\w{4})","$1*****$2"));
			u.put("mobileNo", users.get(i).getMobileNo());
			u.put("mainOrgName", users.get(i).getMain_ORGId());
			u.put("mainPosName", users.get(i).getMainPositionId());
			result.add(u);
		}
		return result;
	}

	@RequestMapping(value = "/updateUser.do")
	public String updateUser(){
		return "xxx/demo/user_update.ui";
	}

	@RequestMapping(value = "/addUser.do")
	public String addUser(){
		return "xxx/demo/user_add.ui";
	}

	@RequestMapping(value = "/isExistUserCode.do",method = RequestMethod.GET)
	@ResponseBody
	public boolean isExistUserCode(String userCode){
		return userService.isExistUserCode(userCode);
	}
	
}
