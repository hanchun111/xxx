package com.bosssoft.cloud.xxx.entity;

import java.sql.Timestamp;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Id;
import javax.persistence.Table;

@Table(name = "AFA_USER")
public class User {

	@Id
	@Column(name = "USER_ID")
	private Integer userId;			//用户ID

	@Column(name = "TENANT_ID")
	private String tenantId;		//租户ID

	@Column(name = "USER_CODE")
	private String userCode;		//用户账号

	@Column(name="USER_NAME")
	private String userName;		//用户名称

	@Column(name = "PASSWORD")
	private String password;		//用户密码

	@Column(name = "USER_TYPE")
	private String userType;		//用户类型(admin）

	@Column(name = "IDENTITY_CODE")
	private String identityCode;	//用户身份证号

	@Column(name = "INVLIDATE")
	private Date invlidate;			//密码失效日期

	@Column(name = "AUTH_MODE")
	private String authMode;		//本地密码认证、LDAP 认证等

	@Column(name = "STATUS")
	private String status;			//正常，挂起，注销，锁定

	@Column(name = "UNLOCK_TIME")
	private Timestamp unlockTime;	//当状态为锁定时，解锁的时间

	@Column(name = "MENU_STYLE")
	private String menuStyle;		//菜单风格

	@Column(name = "MENU_ROLE")
	private String menuRole;		//菜单风格角色

	@Column(name = "LASTEST_LOGIN")
	private Timestamp lastestLogin;	//最近登录时间

	@Column(name = "ERROR_COUNT")
	private int errorCount;			//密码错误次数

	@Column(name = "START_DATE")
	private Date startDate;			//用户有效日期

	@Column(name = "END_DATE")
	private Date endDate;			//用户失效日期

	@Column(name = "MAC_ADDRESS")
	private String macAddress;		//允许设置多个 MAC 地址

	@Column(name = "IP_ADDRESS")
	private String ipAddress;		//允许设置多个 IP 地址

	@Column(name = "MOBILE_NO")
	private String mobileNo;		//手机号码

	@Column(name = "EMAIL")
	private String email;			//Email地址

	@Column(name = "CA_SN")
	private String CASN;			//绑定CA序列号

	@Column(name = "MAJOR_USERCODE")
	private String majorUserCode;	//直接主管

	@Column(name = "MAJOR_USERNAME")
	private String majorUserName;	//主管姓名

	@Column(name = "MAIN_ORGID")
	private String main_ORGId;		//所属(主)机构

	@Column(name = "MAIN_POSITIONID")
	private String mainPositionId;	//所属(主)岗位

	@Column(name = "CREATE_USER")
	private String createUser;		//创建人

	@Column(name = "CREATE_TIME")
	private Timestamp createTime;	//创建时间

	@Column(name = "LAST_MODIFY_TIME")
	private  Long lastModifyTime;	//最新修改时间

	@Column(name = "IS_DELETE")
	private String isDelete;			//是否删除

	@Column(name = "IS_MODIFY")
	private String isModify;			//密码是否修改


	public Integer getUserId() {
		return userId;
	}

	public void setUserId(Integer userId) {
		this.userId = userId;
	}

	public String getTenantId() {
		return tenantId;
	}

	public void setTenantId(String tenantId) {
		this.tenantId = tenantId;
	}

	public String getUserCode() {
		return userCode;
	}

	public void setUserCode(String userCode) {
		this.userCode = userCode;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getUserType() {
		return userType;
	}

	public void setUserType(String userType) {
		this.userType = userType;
	}

	public String getIdentityCode() {
		return identityCode;
	}

	public void setIdentityCode(String identityCode) {
		this.identityCode = identityCode;
	}

	public Date getInvlidate() {
		return invlidate;
	}

	public void setInvlidate(Date invlidate) {
		this.invlidate = invlidate;
	}

	public String getAuthMode() {
		return authMode;
	}

	public void setAuthMode(String authMode) {
		this.authMode = authMode;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Timestamp getUnlockTime() {
		return unlockTime;
	}

	public void setUnlockTime(Timestamp unlockTime) {
		this.unlockTime = unlockTime;
	}

	public String getMenuStyle() {
		return menuStyle;
	}

	public void setMenuStyle(String menuStyle) {
		this.menuStyle = menuStyle;
	}

	public String getMenuRole() {
		return menuRole;
	}

	public void setMenuRole(String menuRole) {
		this.menuRole = menuRole;
	}

	public Timestamp getLastestLogin() {
		return lastestLogin;
	}

	public void setLastestLogin(Timestamp lastestLogin) {
		this.lastestLogin = lastestLogin;
	}

	public int getErrorCount() {
		return errorCount;
	}

	public void setErrorCount(int errorCount) {
		this.errorCount = errorCount;
	}

	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	public String getMacAddress() {
		return macAddress;
	}

	public void setMacAddress(String macAddress) {
		this.macAddress = macAddress;
	}

	public String getIpAddress() {
		return ipAddress;
	}

	public void setIpAddress(String ipAddress) {
		this.ipAddress = ipAddress;
	}

	public String getMobileNo() {
		return mobileNo;
	}

	public void setMobileNo(String mobileNo) {
		this.mobileNo = mobileNo;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getCASN() {
		return CASN;
	}

	public void setCASN(String CASN) {
		this.CASN = CASN;
	}

	public String getMajorUserCode() {
		return majorUserCode;
	}

	public void setMajorUserCode(String majorUserCode) {
		this.majorUserCode = majorUserCode;
	}

	public String getMajorUserName() {
		return majorUserName;
	}

	public void setMajorUserName(String majorUserName) {
		this.majorUserName = majorUserName;
	}

	public String getMain_ORGId() {
		return main_ORGId;
	}

	public void setMain_ORGId(String main_ORGId) {
		this.main_ORGId = main_ORGId;
	}

	public String getMainPositionId() {
		return mainPositionId;
	}

	public void setMainPositionId(String mainPositionId) {
		this.mainPositionId = mainPositionId;
	}

	public String getCreateUser() {
		return createUser;
	}

	public void setCreateUser(String createUser) {
		this.createUser = createUser;
	}

	public Timestamp getCreateTime() {
		return createTime;
	}

	public void setCreateTime(Timestamp createTime) {
		this.createTime = createTime;
	}

	public Long getLastModifyTime() {
		return lastModifyTime;
	}

	public void setLastModifyTime(Long lastModifyTime) {
		this.lastModifyTime = lastModifyTime;
	}

	public String getIsDelete() {
		return isDelete;
	}

	public void setIsDelete(String isDelete) {
		this.isDelete = isDelete;
	}

	public String getIsModify() {
		return isModify;
	}

	public void setIsModify(String isModify) {
		this.isModify = isModify;
	}
}
