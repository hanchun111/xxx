package com.bosssoft.cloud.xxx.entity;

import java.io.Serializable;
import java.util.Date;

/**
 * 
 * 菜单信息
 *
 * @author wengzr (mailto:wzr5908@bosssoft.com.cn)
 */
/*
 * 修改历史 $Log$
 */
public class ApiMenu implements Serializable {
	/**
	 * Comment for <code>serialVersionUID</code>
	 */
	private static final long serialVersionUID = 1L;
	/**
	 * 菜单ID
	 */
	private String menuId;

	/**
	 * 菜单名称
	 */
	private String menuName;

	/**
	 * 菜单编码
	 */
	private String menuCode;

	/**
	 * 是否叶子
	 */
	private String isLeaf;

	/**
	 * 菜单URL
	 */
	private String menuUrl;

	/**
	 * 菜单参数
	 */
	private String menuParam;

	/**
	 * 父菜单ID
	 */
	private String parentMenuId;

	/**
	 * 菜单级别
	 */
	private Integer menuLevel;

	/**
	 * 显示顺序
	 */
	private Integer sortNo;

	/**
	 * 折叠图标
	 */
	private String collapseIcon;

	/**
	 * 展开图标
	 */
	private String expandIcon;

	/**
	 * 菜单序列
	 */
	private String menuSeq;

	/**
	 * 打开方式
	 */
	private String openMode;

	/**
	 * 子菜单数量
	 */
	private Integer subcount;

	/**
	 * 功能编码
	 */
	private String funcCode;

	/**
	 * 应用ID
	 */
	private String appId;
	
	/**
	 * 菜单应用ID
	 */
	private String menuAppId;

	/**
	 * 租户ID
	 */
	private String tenantId;
	
	private Date createTime;
	
	private String context;
	
	public String getMenuAppId() {
		return menuAppId;
	}

	public void setMenuAppId(String menuAppId) {
		this.menuAppId = menuAppId;
	}

	public String getContext() {
		return context;
	}

	public void setContext(String context) {
		this.context = context;
	}

	public Date getCreateTime()
    {
        return createTime;
    }

    public void setCreateTime(Date createTime)
    {
        this.createTime = createTime;
    }

    /**
	 * 获取菜单ID
	 *
	 * @return MENU_ID - 菜单ID
	 */
	public String getMenuId() {
		return menuId;
	}

	/**
	 * 设置菜单ID
	 *
	 * @param menuId
	 *            菜单ID
	 */
	public void setMenuId(String menuId) {
		this.menuId = menuId;
	}

	/**
	 * 获取菜单名称
	 *
	 * @return MENU_NAME - 菜单名称
	 */
	public String getMenuName() {
		return menuName;
	}

	/**
	 * 设置菜单名称
	 *
	 * @param menuName
	 *            菜单名称
	 */
	public void setMenuName(String menuName) {
		this.menuName = menuName;
	}

	/**
	 * 获取菜单编码
	 *
	 * @return MENU_CODE - 菜单编码
	 */
	public String getMenuCode() {
		return menuCode;
	}

	/**
	 * 设置菜单编码
	 *
	 * @param menuCode
	 *            菜单编码
	 */
	public void setMenuCode(String menuCode) {
		this.menuCode = menuCode;
	}

	/**
	 * 获取是否叶子
	 *
	 * @return IS_LEAF - 是否叶子
	 */
	public String getIsLeaf() {
		return isLeaf;
	}

	/**
	 * 设置是否叶子
	 *
	 * @param isLeaf
	 *            是否叶子
	 */
	public void setIsLeaf(String isLeaf) {
		this.isLeaf = isLeaf;
	}

	/**
	 * 获取菜单URL
	 *
	 * @return MENU_URL - 菜单URL
	 */
	public String getMenuUrl() {
		return menuUrl;
	}

	/**
	 * 设置菜单URL
	 *
	 * @param menuUrl
	 *            菜单URL
	 */
	public void setMenuUrl(String menuUrl) {
		this.menuUrl = menuUrl;
	}

	/**
	 * 获取菜单参数
	 *
	 * @return MENU_PARAM - 菜单参数
	 */
	public String getMenuParam() {
		return menuParam;
	}

	/**
	 * 设置菜单参数
	 *
	 * @param menuParam
	 *            菜单参数
	 */
	public void setMenuParam(String menuParam) {
		this.menuParam = menuParam;
	}

	/**
	 * 获取父菜单ID
	 *
	 * @return PARENT_MENU_ID - 父菜单ID
	 */
	public String getParentMenuId() {
		return parentMenuId;
	}

	/**
	 * 设置父菜单ID
	 *
	 * @param parentMenuId
	 *            父菜单ID
	 */
	public void setParentMenuId(String parentMenuId) {
		this.parentMenuId = parentMenuId;
	}

	/**
	 * 获取菜单级别
	 *
	 * @return MENU_LEVEL - 菜单级别
	 */
	public Integer getMenuLevel() {
		return menuLevel;
	}

	/**
	 * 设置菜单级别
	 *
	 * @param menuLevel
	 *            菜单级别
	 */
	public void setMenuLevel(Integer menuLevel) {
		this.menuLevel = menuLevel;
	}

	/**
	 * 获取显示顺序
	 *
	 * @return SORT_NO - 显示顺序
	 */
	public Integer getSortNo() {
		return sortNo;
	}

	/**
	 * 设置显示顺序
	 *
	 * @param sortNo
	 *            显示顺序
	 */
	public void setSortNo(Integer sortNo) {
		this.sortNo = sortNo;
	}

	/**
	 * 获取折叠图标
	 *
	 * @return COLLAPSE_ICON - 折叠图标
	 */
	public String getCollapseIcon() {
		return collapseIcon;
	}

	/**
	 * 设置折叠图标
	 *
	 * @param collapseIcon
	 *            折叠图标
	 */
	public void setCollapseIcon(String collapseIcon) {
		this.collapseIcon = collapseIcon;
	}

	/**
	 * 获取展开图标
	 *
	 * @return EXPAND_ICON - 展开图标
	 */
	public String getExpandIcon() {
		return expandIcon;
	}

	/**
	 * 设置展开图标
	 *
	 * @param expandIcon
	 *            展开图标
	 */
	public void setExpandIcon(String expandIcon) {
		this.expandIcon = expandIcon;
	}

	/**
	 * 获取菜单序列
	 *
	 * @return MENU_SEQ - 菜单序列
	 */
	public String getMenuSeq() {
		return menuSeq;
	}

	/**
	 * 设置菜单序列
	 *
	 * @param menuSeq
	 *            菜单序列
	 */
	public void setMenuSeq(String menuSeq) {
		this.menuSeq = menuSeq;
	}

	/**
	 * 获取打开方式
	 *
	 * @return OPEN_MODE - 打开方式
	 */
	public String getOpenMode() {
		return openMode;
	}

	/**
	 * 设置打开方式
	 *
	 * @param openMode
	 *            打开方式
	 */
	public void setOpenMode(String openMode) {
		this.openMode = openMode;
	}

	/**
	 * 获取子菜单数量
	 *
	 * @return SUBCOUNT - 子菜单数量
	 */
	public Integer getSubcount() {
		return subcount;
	}

	/**
	 * 设置子菜单数量
	 *
	 * @param subcount
	 *            子菜单数量
	 */
	public void setSubcount(Integer subcount) {
		this.subcount = subcount;
	}

	/**
	 * 获取功能编码
	 *
	 * @return FUNC_CODE - 功能编码
	 */
	public String getFuncCode() {
		return funcCode;
	}

	/**
	 * 设置功能编码
	 *
	 * @param funcCode
	 *            功能编码
	 */
	public void setFuncCode(String funcCode) {
		this.funcCode = funcCode;
	}

	/**
	 * 获取应用ID
	 *
	 * @return APP_ID - 应用ID
	 */
	public String getAppId() {
		return appId;
	}

	/**
	 * 设置应用ID
	 *
	 * @param appId
	 *            应用ID
	 */
	public void setAppId(String appId) {
		this.appId = appId;
	}

	/**
	 * 获取租户ID
	 *
	 * @return TENANT_ID - 租户ID
	 */
	public String getTenantId() {
		return tenantId;
	}

	/**
	 * 设置租户ID
	 *
	 * @param tenantId
	 *            租户ID
	 */
	public void setTenantId(String tenantId) {
		this.tenantId = tenantId;
	}
}