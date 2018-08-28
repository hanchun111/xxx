package com.bosssoft.cloud.xxx.mapper;

import com.bosssoft.cloud.xxx.entity.User;
import com.bosssoft.platform.persistence.common.Mapper;

public interface UserMapper extends Mapper<User>{
    public int selectByUserCode(String userCode);

    public User selectUserByUserCode(String userCode);
}
