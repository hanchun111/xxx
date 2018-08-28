define(	["app/widgets/app-widget", "formdesign/jquery.window",
				"formdesign/jquery.treegrid","app/widgets/button/app-button"], function(Widget) {
			/*
			 * "textfield" : TextFieldControl, "combobox" : ComboBoxControl,
			 * "label" : LabelControl, "grid" : GridControl, "page":PageControl,
			 * "tabpanel":TabControl, "panel":PanelControl,
			 * "hidden":HiddenFieldControl, "jqgrid":JqGridControl,
			 * "textarea":TextAreaControl,
			 */
			// "tree":TreeControl
			// 控件属性定义配置
			attrDefineConfig = {
				BaseComponent : {
					attrs : {
						id : {
							editor : 'text',
							name : 'id',
							group:'杂项'
						},
						top : {
							editor : 'number',
							name : 'top坐标',
							group:'布局'
						},
						left : {
							editor : 'number',
							name : 'left坐标',
							group:'布局'
						},
						width : {
							editor : 'number',
							name : '宽度',
							group:'布局'
						},
						height : {
							editor : 'number',
							name : '高度',
							group:'布局'
						},
						autoLayout : {
							name : '是否自动排版',
							hidden : true,
							group:'杂项'
						},
						forPanel : {
							name : '跟随面板id',
							hidden : true,
							group:'杂项'
						},
						isCustom : {
							name : '是否可自定义控件',
							hidden : false,
							group:'杂项'
						},
						// autoLayout="true" isCustom="false"
						hidden : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '是否隐藏',
							value : false,
							dataType : "Boolean",
							group:'行为'
						},
						events : {
							name : '事件',
							group:'杂项'
						},
						type : {
							name : '控件类型',
							group:'杂项'
						},
						style : {
							name : '样式',
							group:'外观'
						}
					}
				},
				ButtonArea:{
					superClass : "BaseComponent",
					attrEvents : {
							"buttons" : {
							onClick : function(parentDlg) {
								/*var node = $("#" + parentDlg.gridId)
										.treegrid('getSelected');*/
								var buttons = this.get("buttons");
								var _self = this;
								var dlg = new TreeGridDialog({
											colnumData : buttons,
											// dataKey : "columns",
											title : '操作列按钮设置',
											dataReader : {
												idField : 'id',
												treeField : 'id',
												newDataTpl : {
													id : "btn",
													field : "name"
												}
											}
										});
								// id="del" name="删除" icon="btn-delete"
								// iconMode="ONLYICON"
								// handle="hbill.deleteLineGrid2('${id}')"
								dlg.set("columns", [{
													title : '按钮id',
													field : "id",
													width : 100,
													editor : 'text'
												}, {
													title : '按钮名称',
													field : "text",
													width : 200,
													editor : 'text'
												}, {
													title : 'icon',
													field : "icon",
													width : 100,
													editor : 'text'
												}, {
													title : '事件',
													field : "handler",
													width : 200,
													editor : 'text'
												}, {
													title : '样式',
													field : "style",
													width : 400,
													editor : 'text'
												}]);
								dlg.on("close", function(data) {
									_self.setControlAttr("buttons", data);
											
										});
								// dlg.setBindControl(_self)
								dlg.show();
							}

						}
					},
					attrs:{
						displayType : {
							editor : {
								type : "combobox",
								options : {
									data : [{
												id : "MENU",
												name : "MENU"
											}, {
												id : "BUTTON",
												name : "BUTTON"
											}, {
												id : "DIALOG",
												name : "DIALOG"
											}]
								}
							},
							value:"BUTTON",
							name : '显示类型',
							group:"外观"
							},
						buttons:{
						
							width : 100,
							editor : {
								type : "button"
							},
							name : '按钮列表',
							group:"杂项"
						}
					},
					attrDefaultValue : {
							type : 'buttonarea'
					}
				},
				ButtonMenu : {
					superClass : "Button",
					attrs : {
						menu : {
							editor : {
								type : 'button'
							},
							name : '下拉菜单',
							group:"杂项"
						}

					},
					attrEvents : {
						"menu" : {
							onClick : function(parentDlg) {
								var _self = this, colnumData;
								colnumData = _self.get("menu")
								var dlg = new TreeGridDialog({
											colnumData : colnumData,
											dataReader : {
												idField : 'id',
												treeField : 'text',
												newDataTpl : {
													id : "menuItemId",
													text : "menuItemText"
												}
											},
											title : '菜单设置'
										});

								dlg.set("columns", [{

													field : 'text',
													title : '文本',
													editor : 'text',
													width : 300

												}, {

													field : 'id',
													title : '控件id',
													editor : 'text',
													width : 150

												}, {

													field : 'iconCls',
													title : '图标样式',
													editor : 'text',
													width : 100

												}]);
								dlg.on("close", function(data) {

											_self.setControlAttr("menu", data);
										})
								// dlg.setBindControl(_self)
								dlg.show();
							}

						}
					}
				},
				Button : {
					superClass : "BaseComponent",
					attrs : {
						toggle : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '启动按钮切换状态',
							value : "false",
							dataType : "Boolean"

						},

						toggle : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '启动按钮切换状态',
							value : "false",
							dataType : "Boolean",
							group:"行为"

						},
						selected : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '按钮状态',
							value : "false",
							dataType : "Boolean",
							group:"杂项"
						},
						group : {
							editor : 'text',
							name : '分组名称',
							group:"杂项"
						},
						text : {
							editor : 'text',
							name : '按钮文本',
							group:"外观"
						},
						icoCls : {
							editor : 'text',
							name : '图标样式',
							group:"外观"
						},
						iconAlign : {
							type : "combobox",
							options : {
								data : [{
											id : "left",
											name : "left"
										}, {
											id : "right",
											name : "right"
										}]
							},
							name : '图标位置',
							group:"外观"
						},
						plain : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '是否平板化',
							value : "true",
							dataType : "Boolean",
							group:"外观"
						}

						,
						height : {
							name : '高度',
							group:"布局"
						}
					},
					attrDefaultValue : {
						type : 'button',
						toggle : false,
						selected : false,
						plain : false,
						group : false,
						text : '按钮',
						width : 88,
						height : 33,
						iconCls : '',
						iconAlign : false,
						size : 'small'
					}

				},
				Page : {
					superClass : "BaseComponent",

					attrDefaultValue : {
						type : 'page',
						width : 794,
						height : 600

					},
					attrs : {
						layout : {

							editor : {
								type : "combobox",
								options : {
									data : [{
												id : "",
												name : "none"
											}, {
												id : "border",
												name : "border"
											}, {
												id : "vbox",
												name : "vbox"
											}, {
												id : 'absolute',
												name : 'absolute'
											}]
								}
							},
							name : '布局'
						},
						js : {
							name : 'js路径'
						},
						jsId : {

							name : 'jsId'
						},
						onPageLoad : {
							name : '页面初始化事件'
						}
					}
				},
				ColumnButton : {
					superClass : "BaseComponent",
					attrs : {
						name : {
							editor : 'text',
							name : '按钮名称'
						},
						handle : {
							editor : 'text',
							name : '点击事件'
						},
						icon : {
							editor : 'text',
							name : '图标'
						}
					}
				},
				/*
				 * attrDefaultValue:{ hidden:false },
				 */
				Field : {
					superClass : "BaseComponent",
					attrs : {
						required: {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '是否必填',
							value : "false",
							dataType : "Boolean",
							group:"行为"
						},
						labelWidth : {
							editor : 'text',
							name : '标签宽度',
							group:"外观"
						},
						labelText : {
							editor : 'text',
							name : '标签文本',
							group:"杂项"
						},
						value : {
							editor : 'text',
							name : '值',
							group:"外观"
						},
						field : {
							editor : 'text',
							name : '对应后台字段',
							group:"数据"
						},
						forForm : {

							name : '表单分组',
							group:"杂项"
						}
						/* type : 'field', */

						/*
						 * showField:'', field:""
						 */

					}

				},
				Hidden : {
					superClass : "Field",
					attrs : {},
					attrDefaultValue : {
						type : "hidden",
						width : 18,
						height : 15
					}
				},
				Textbox : {
					superClass : "Field",
					attrDefaultValue : {
						type : 'textfield',
						height : 40,
						width : 200,
						fieldType : 'textbox',
						labelText : ''
					},
					attrs : {
						filter: {
							editor : 'text',
							name : '输入规则',
							group:"行为"
						},
						gearRules: {
							editor : 'text',
							name : '联动规则',
							group:"行为"
						},
						fieldType : {
						
							value : 'textbox',
							name : '编辑框类型',
							group:"行为"
						},
						maxLength : {
							editor : 'text',
							name : '最大字符',
							group:"行为"
						},
						readOnly : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '是否只读',
							value : "false",
							dataType : "Boolean",
							group:"行为"
						},
						disabled : {
							editor : {
								type : 'checkbox',
								options : {
									on : "'true",
									off : "false"
								}
							},
							name : '是否禁用',
							value : "false",
							dataType : "Boolean",
							group:"行为"
						},
						style : {
							editor : 'text',
							name : '显示值文本框的样式',
							group:"外观"
						},
						wrapstyle : {
							editor : 'text',
							name : '包装器的css样式',
							group:"外观"
						},
						tips : {
							editor : {
								type : 'text'
							},
							name : '辅助提示信息',
							group:"外观"
						},
						trim : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '是否去除空格',
							value : "false",
							dataType : "Boolean",
							group:"行为"
							
						}
					}
				},

				TextArea : {
					superClass : "Textbox",
					attrDefaultValue : {
						height : 60,
						width : 400
					}

				},
				DateTime : {
					superClass : "Textbox",
					attrs : {
						/**
						 * <span class="type-signature static">override</span>
						 * 是否拥有一个打开按钮
						 * 
						 * @memberof datetime
						 * @property {Boolean} [openbtn=true] 拥有打开按钮
						 */
						openbtn : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}

							},
							value : "true",
							dataType : "Boolean",
							name : '是否显示打开按钮',
							group:"外观"
						},
						/**
						 * 是否只能选择
						 * 
						 * @memberof datetime
						 * @property {Boolean} [onlySelect=false] 可以选择和输入
						 */
						onlySelect : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}

							},
							value : "false",
							dataType : "Boolean",
							name : '是否只能选择',
							group:"行为"
						},
						/**
						 * 日期时间框类型
						 * 
						 * <PRE>
						 * type可选类型：
						 * year: 年  eg. 2014
						 * month: 月  eg. 12
						 * year-month: 年月 eg. 2014-12
						 * date: 年月日  eg. 2014-12-12
						 * datetime: 年月日时分  eg. 2014-12-12 12:12
						 * hour-minute: 时分  eg. 12:12
						 * hour: 时  eg. 12
						 * minute: 分  eg. 12
						 * </PRE>
						 * 
						 * @memberof datetime
						 * @property {String} [type=date] 类型
						 */
						type : {

							editor : {
								type : "combobox",
								options : {
									data : [{
												id : "year",
												name : "year"
											}, {
												id : "month",
												name : "month"
											}, {
												id : "year-month",
												name : "year-month"
											}, {
												id : "date",
												name : "date"
											}, {
												id : "datetime",
												name : "datetime"
											}, {
												id : " hour-minute",
												name : " hour-minute"
											}, {
												id : " hour",
												name : " hour"
											}, {
												id : " minute",
												name : " minute"
											}]
								}
							},

							value : 'date',
							name : '日期时间框类型',
							group:"外观"
						},
						/**
						 * 日期时间格式化串
						 * 
						 * <PRE>
						 * p
						 * , P, h, hh, i, ii, s, ss, d, dd, m, mm, M, MM, yy, yyyy 的任意组合。
						 * p : 小写的 ('am' or 'pm') - 根据区域文件
						 * P : 大写的 ('AM' or 'PM') - 根据区域文件
						 * s : 10以下不用0填充首位的秒数
						 * ss : 2位秒数显示，10以下用0填充首位
						 * i : 10以下不用0填充首位的分数
						 * ii : 2位分数显示，10以下用0填充首位
						 * h : 10以下不用0填充首位的时数 - 24小时制
						 * hh : 2位时数显示，10以下用0填充首位 - 24小时制
						 * H : 10以下不用0填充首位的时数 - 12小时制
						 * HH : 2位时数显示，10以下用0填充首位 - 12小时制
						 * d : 10以下不用0填充首位的日期
						 * dd : 2位日期显示，10以下用0填充首位
						 * m : 10以下不用0填充首位的月份
						 * mm : 2位月份显示，10以下用0填充首位
						 * M : 月份的短文本表示，前三个字母
						 * MM : 月份的全文本表示，如 January or March
						 * yy : 2位年份显示
						 * yyyy : 4位年份显示
						 * </PRE>
						 * 
						 * @memberof datetime
						 * @property {String} [format=yyyy-mm-dd] 格式化串
						 */
						// format : 'yyyy-mm-dd',
						/**
						 * 语言
						 * 
						 * @memberof datetime
						 * @property {String} [language=zh_CN] 语言
						 */
						// language : AppLang.locale,
						/**
						 * 一周从哪一天开始。0（星期日）到6（星期六）
						 * 
						 * @memberof datetime
						 * @property {String} [weekStart=1] 一周从哪一天开始
						 */
						// weekStart : 1,
						/**
						 * 当选择一个日期之后是否立即关闭此日期时间选择器
						 * 
						 * @memberof datetime
						 * @property {Boolean} [autoclose=true] 自动关闭
						 */
						autoclose : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}

							},
							value : "true",
							name : '自动关闭',
							group:"行为"
						},
						/**
						 * 是否显示今天按钮
						 * 
						 * <PRE>
						 * 如果此值为true
						 * 或 &quot;linked&quot;，
						 * 		则在日期时间选择器组件的底部显示一个 &quot;Today&quot; 按钮用以选择当前日期。
						 * 如果是true的话，&quot;Today&quot; 按钮仅仅将视图转到当天的日期.
						 * 如果是&quot;linked&quot;，当天日期将会被选中
						 * </PRE>
						 * 
						 * @memberof datetime
						 * @property {Boolean} [todayBtn=true] 显示今天按钮
						 */
						todayBtn : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}

							},
							value : "true",
							name : '显示今天按钮',
							group:"外观"
						},
						/**
						 * 高亮当前日期
						 * 
						 * @memberof datetime
						 * @property {Boolean} [todayHighlight=true] 高亮当前日期
						 */
						todayHighlight : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}

							},
							value : "true",
							name : '高亮当前日期',
							dataType : "Boolean",
							group:"外观"
						},
						/**
						 * 日期时间选择器打开之后首先显示的视图。
						 * 
						 * <PRE>
						 * 可接受的值
						 * 0 小时视图 
						 * 1 日期视图
						 * 2 月视图
						 * 3 年视图
						 * 4 十年视图
						 * </PRE>
						 * 
						 * @memberof datetime
						 * @property {Number} [startView=2] 起始视图
						 */
						startView : {

							editor : {
								type : "combobox",
								options : {
									data : [{
												id : "0",
												name : "小时视图"
											}, {
												id : "1",
												name : "日期视图"
											}, {
												id : "2",
												name : "月视图"
											}, {
												id : "3",
												name : "年视图"
											}, {
												id : "4",
												name : "十年视图"
											}]
								}
							},

							value : '2',
							name : '起始视图',
							group:"外观"
						},
						/**
						 * 日期时间选择器所能够提供的最精确的时间选择视图。
						 * 
						 * <PRE>
						 * 可接受的值
						 * 0 小时视图 
						 * 1 日期视图
						 * 2 月视图
						 * 3 年视图
						 * 4 十年视图
						 * </PRE>
						 * 
						 * @memberof datetime
						 * @property {Number} [minView=2] 结束视图
						 */
						minView : {
							editor : {
								type : "combobox",
								options : {
									data : [{
												id : "0",
												name : "小时视图"
											}, {
												id : "1",
												name : "日期视图"
											}, {
												id : "2",
												name : "月视图"
											}, {
												id : "3",
												name : "年视图"
											}, {
												id : "4",
												name : "十年视图"
											}]
								}
							},

							value : '2',
							name : '结束视图',
							group:"外观"
						}

					}
				},
				Number : {
					superClass : "Textbox",
					attrDefaultValue : {
						fieldType : 'number'
					},
					/**
					 * 最小值 组件允许接受的最小值
					 * 
					 * @memberof number
					 * @property {Number} [min=null] 最小值
					 */
					attrs : {
						min : {
							editor : 'text',
							name : '最小值',
							group:"行为"
						},
						/**
						 * 最大值 组件允许接受的最大值
						 * 
						 * @memberof number
						 * @property {Number} [max=null] 最大值
						 */
						max : {
							editor : 'text',
							name : '最大值',
							group:"行为"
						},
						/**
						 * 不定长精度
						 * 
						 * <PRE>
						 * false：为定长的进度，即精度为几位，则保留几位小数
						 * 	true：为不定长的进度，即输入的进度为几位，则最大保留到几位，此时precision代表最大精度
						 * </PRE>
						 * 
						 * @memberof number
						 * @property {Number} [varlen=false] 变长精度
						 */
						varlen : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : ' 不定长精度',
							dataType : "Boolean",
							group:"行为"
						},
						/**
						 * 精度
						 * 
						 * @memberof number
						 * @property {Number} [precision=0] 保留0位小数
						 */
						precision : {
							editor : 'text',
							name : '精度',
							dataType : "Boolean",
							group:"行为"
						},
						/**
						 * 前缀
						 * 
						 * @memberof number
						 * @property {String} [prefix=''] 前缀
						 */
						prefix : {
							editor : 'text',
							name : '前缀',
							group:"外观"
						},
						/**
						 * 后缀
						 * 
						 * @memberof number
						 * @property {String} [suffix=''] 后缀
						 */
						suffix : {
							editor : 'text',
							name : '后缀',
							group:"外观"
						},
						/**
						 * <span class="type-signature static">override</span>
						 * 定义如何筛选按下的键，返回true接受输入
						 * 
						 * <PRE>
						 * 内置过滤类型
						 * number: 只允许输入 0-9，小数点，正负号
						 * 0-9：只允许输入 0-9
						 * all：任意输入
						 * </PRE>
						 * 
						 * @memberof number
						 * @property {String|Function} [filter='number']
						 *           键盘输入的过滤器
						 */
						formatter : {
							editor : {
								type : 'text'
							},
							name : "格式化",
							dataType : "String"
							,
							group:"外观"
						},
						/**
						 * 定义格式化输出显示值。返回的字符串值，会显示在输入框中
						 * 
						 * <PRE>
						 * 内置格式化方法
						 * 大写金额：chinese
						 * 千分位金额：thousand
						 * </PRE>
						 * 
						 * @memberof number
						 * @property {String|Function} [formatter] 格式化函数
						 */
						// formatter: null,
						/**
						 * 当值为0时 显示为空
						 * 
						 * @memberof number
						 * @property {String|Function} [zeroIsNull=false] 0显示为0
						 */
						zeroIsNull : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : ' 为0时显示为空',
							dataType : "Boolean",
							group:"外观"
						}
					}
				},
				Money : {
					superClass : "Textbox",
					attrDefaultValue : {
						fieldType : 'money'
					},
					attrs : {
						precision : {
							editor : {
								type : 'text'
							},
							name : "小数点个数",
							group:"行为"
						},
						formatter : {
							editor : {
								type : 'text'
							},
							name : "格式化",
							group:"外观"
						},
						prefix : {
							editor : {
								type : 'text'
							},
							name : "前缀",
							group:"外观"
						}
					}

				},
				Checkbox : {
					superClass : "Textbox",
					attrs : {
						textfield : {
							editor : 'text',
							name : '显示值属性名',
							group:"数据"
						},
						valuefield : {
							editor : 'text',
							name : '隐藏值属性名',
							group:"数据"
						},
						orient : {
							editor : {
								type : "combobox",
								options : {
									data : [{
												id : "horizontal",
												name : "horizontal"
											}, {
												id : "vertical",
												name : "vertical"
											}]
								}
							},
							name : '布局方式',
							value : 'horizontal',
							group:"外观"
						}
					},
					attrDefaultValue : {
						height : 25,
						width : 200,
						labelText : "checkbox1",
						type : 'checkbox'
					},
					removeAttrs : ["trim"],
					disabelAttrs : []
				},
				Combo : {
					superClass : "Textbox",
					attrDefaultValue : {
						fieldType : "combobox"
					},
					attrs : {
						url : {
							editor : 'text',
							name : 'url地址',
							group:"数据"
						},
						fieldType : {
							/*
							 * editor : { type : "combobox", options : { data : [{
							 * id : "combobox", name : "combobox" }, { id :
							 * "combogrid", name : "combogrid" }, { id :
							 * "comboztree", name : "comboztree" }] } },
							 */
							name : '编辑框类型',
							group:"杂项"
						},
						panelwidth : {
							editor : 'number',
							name : '下拉面板的宽度',
							group:"外观"
						},
						panelheight : {
							editor : 'text',
							name : '下拉面板的高度',
							group:"外观"
						},
						maxpanelheight : {
							editor : 'text',
							name : '下拉面板最大高度',
							group:"外观"
						},
						text : {
							editor : 'text',
							name : '文本',
							group:"外观"
						},
						valuefield : {
							editor : 'text',
							name : '隐藏字段',
							group:"数据"
						},
						textfield : {
							editor : 'text',
							name : '显示字段',
							group:"数据"
						},
						showfield : {
							editor : 'text',
							name : '填充数据显示字段',
							group:"数据"

						},
						formatter : {
							editor : 'text',
							name : '格式化配置',
							group:"外观"
						},
						clearbtn : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							value : "false",
							name : '是否显示清除按钮',
							dataType : "Boolean",
							group:"外观"
							
							
						},
						customPanelHeight:{
						    editor : 'text',
							name : '自定义面板高度',
							value : "",
							group:"外观"
							
						},
						acceptText: {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							value : "false",
							name : '接受输入的内容作为值',
							dataType : "Boolean",
							group:"行为"
						}
						,
						openbtn : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}

							},
							value : "false",
							name : '是否显示打开按钮',
							dataType : "Boolean",
							group:"外观"
						}
					}
				},
				Combobox : {
					superClass : "Combo",
					attrs : {

						multiple : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							value : "false",
							name : "是否多选",
							dataType : "Boolean",
							group:"行为"
						},
						data : {
							name : "数据项",
							group:"杂项"
						},
						/** 
						 * 是否远程加载，该属性优先于async
						 * false：第一次根据suggest进行远程加载作为数据源，此后根据本地数据源进行联想匹配
						 * true: 如果为true，则每次根据suggest去后台匹配数据
						 * @memberof suggest
						 * @property {Boolean} [remote=false] 每次远程联想
						 */
						remote:  {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							value : "false",
							name : '是否远程加载',
							dataType : "Boolean",
							group:"数据"
						},
						suggestfield : {
							editor : 'text',
							name : '联想过滤属性',
							group:"数据"
						},
						usesuggest : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							value : "false",
							name : '允许联想',
							dataType : "Boolean",
							group:"行为"
						},

						nodeDelete : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							value : "false",
							name : '是否允许删除节点',
							dataType : "Boolean",
							group:"行为"
						}

					},
					attrDefaultValue : {
						type : 'combobox',
						openbtn:'true'
					}
				},
				Comboztree : {

					superClass : 'Combo',
					attrDefaultValue : {
						fieldType : "comboztree"
					},
					attrs : {
						/**
						 * 只能选择叶子节点
						 * 
						 * @memberof comboztree
						 * @property {Boolean} [onlyleaf=false] 只能选择叶子节点
						 */
						onlyleaf : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							value : "false",
							name : '只能选择叶子节点',
							dataType : "Boolean",
							group:"行为"
						},

						/**
						 * 节点唯一标识的属性名称 默认和valuefield相同
						 * 
						 * @memberof comboztree
						 * @property {String} [idfield=null] 节点唯一标识的属性名称
						 */
						idfield : {
							editor : 'text',
							name : '节点字段',
							group:"数据"
						},
						/**
						 * 节点数据中保存其父节点唯一标识的属性名称
						 * 
						 * @memberof comboztree
						 * @property {String} [pidfield=pId] 父节点唯一标识的属性名称
						 */
						pidfield : {
							editor : 'text',
							name : '父节点字段',
							group:"数据"
						},
						/**
						 * 用于修正根节点父节点数据，即 pIdKey 指定的属性值
						 * 
						 * @memberof comboztree
						 * @property {String} [rootpidvalue=''] 根节点属性值
						 */
						rootpidvalue : {
							editor : 'text',
							name : '根节点属性值',
							group:"数据"
						}
					}
				},
				ComboGrid : {
					superClass : 'Combo',
					attrDefaultValue : {
						fieldType : "combogrid",
						openbtn:'true'
					},
					attrEvents : {
						"columns" : {
							onClick : function(parentDlg) {
								var _self = this, colnumData;

								if (_self.type == "combogrid") {
									colnumData = _self.get("columns")

								} else {
									var node = parentDlg.gridObj
											.propertygrid('getSelected');

									if (node) {
										if (node.value && node.value.length > 0) {
											colnumData = node.value;
										} else {
											colnumData = [];
										}
									}

								}

								var dlg = new TreeGridDialog({
											// dataKey : "columns",
											colnumData : colnumData,
											title : '网格列设置'
										});

								dlg.set("columns", getGridColunm(_self, dlg,"Column"));
								// dlg.setBindControl(_self)
								dlg.show();
							}

						}
					},
					attrs : {
						url : {
							editor : 'text',
							name : 'url地址',
							group:"数据"
						},
						/**
						 * 联想过滤时使用的匹配属性，多个属性使用,分隔
						 * 
						 * <PRE style="color:red;">
						 * 当没有配置该属性时，默认使用textfield
						 * 远程联想时 可以通过_key接收输入的搜索关键字、suggestfield接收该字段的配置
						 * </PRE>
						 * 
						 * @memberof combogriD
						 * @property {String} [suggestfield] 匹配属性
						 */
						suggestfield : {
							editor : 'text',
							name : '联想过滤属性',
							group:"数据"
						},
						columns : {
							name : '列信息',
							editor : {
								type : 'button'
							},
							group:"杂项"
						},
						/**
						 * 是否允许网格搜索
						 * 
						 * @todo 当下拉网格不分页时，根据当前页面的数据进行匹配
						 * @todo 当下拉网格存在分页，则根据url进行远程匹配 远程用 _key
						 *       来接受检索关键字，suggestfield来接受检索的匹配属性
						 * 
						 * </PRE>
						 * 
						 * @memberof combogriD
						 * @property {boolean} [search=false] 允许网格搜索
						 */
						search : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							value : "false",
							name : '是否允许网格搜索',
							dataType : "Boolean",
							group:"行为"
						},
						pager:{
							name : '分页条位置',
							group:"外观"
						}
					}
				},
				Reference : {
					superClass : 'Combo',
					attrDefaultValue : {
						fieldType : "reference",
						openbtn : true
					},
					attrs : {
						title : {
							editor : 'text',
							name : '弹出窗标题',
							group:"外观"
						},
						hasheader : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							value : "true",
							dataType : "Boolean",
							name : '是否隐藏标题',
							group:"外观"
						},
						digWidth : {
							editor : 'number',
							name : '弹出窗口宽度',
							group:"外观"
						},
						digHeight : {
							editor : 'number',
							name : '弹出窗口高度',
							group:"外观"
						}

					}
				},

				QueryItem : {
					
					attrs : {
						id : {
							editor : 'text',
							width : 100,
							title : '查询字段'
						},
						
						field : {
							editor : 'text',
							width : 100,
							title : '后台字段'
						},
						labelText : {
							editor : 'text',
							width : 100,
							title : '名称'
						},
						editorType : {
							width : 150,
							editor : {
								type : "combobox",
								options : {
									data : [{
												id : "TEXTBOX",
												name : "TEXTBOX"
											}, {
												id : "NUMBER",
												name : "NUMBER"
											}, {
												id : "MONEY",
												name : "MONEY"
											}, {
												id : "DATETIME",
												name : "DATETIME"
											}, {
												id : "COMBOBOX",
												name : "COMBOBOX"
											}, {
												id : "COMBOGRID",
												name : "COMBOGRID"
											}, {
												id : "COMBOZTREE",
												name : "COMBOZTREE"
											}]
								}
							},
							title : '编辑框类型'
						},
						editOptions : {
							width : 100,
							editor : {
								type : "button"
							},
							title : '编辑框属性'
						},
						visible: {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								},value : "true"
							},
							width:100,
							title : '是否显示',
							value : "true",
							dataType : "Boolean"
						},
						operatort : {
							editor : 'text',
								width : 100,
							title : '查询操作符'

						},
						
						colSpan : {
							editor : 'number',
								width : 100,
							title : '合并列'
						}
					},
					attrEvents : {
						"editOptions" : {
							onClick : function(parentDlg) {
								var _self = this;

								var node = $("#" + parentDlg.gridId)
										.datagrid('getSelected');
										console.log(node)
								if (node.editorType) {

									var propertyDialog = new PropertyDialog({

										title : '编辑框属性设置'
											// dataKey : "columns",

											// columns :
											// getGridColunm(_self)
										});
									var propertyData = node.editOptions;
									var editorType = node.editorType;
									if (colnumEditorAttConfig[editorType]) {
										var propertyKey = colnumEditorAttConfig[editorType];

										var propertys = getControlAttrs(
												propertyKey, _self,
												propertyDialog);
										if (propertyData) {
											for (var i = 0; i < propertys.length; i++) {
												if (propertyData[propertys[i].id]) {
													propertys[i].value = propertyData[propertys[i].id];
												}
											}

										};
										propertyDialog.set("propertyData",
												propertys);
										propertyDialog.on("close", function(
														data) {
													node.editOptions = $
															.extend(
																	true,
																	node.editOptions,
																	data)

												})
										propertyDialog.show();
									}
								}
							}
						}
					}
				},
				Query : {

					superClass : "BaseComponent",
					attrs : {
						queryTarget : {
							editor : 'text',
							name : '查询目票'
						},
						manual : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							value : 'false',
							name : '是否作为手动条件'
						},
						colCount : {
							editor : "number",
							name : "列总数"
						},
						advColCount: {
							editor : "number",
							value : 1,
							name : "高级查询列数"
						},
						quicks : {
							name : '快速查询条件',
							editor : {
								type : 'button'
							}
						},
						advances : {
							name : '高级查询条件',
							editor : {
								type : 'button'
							}
						},
						quickValidator : {
							name : "查询验证"
						},
						advValidator : {
							name : "高级查询验证"
						}
					},
					attrEvents : {
						"quicks" : {
							onClick : function() {
								var _self = this;
								var colnumData = _self.get("quicks");
								var dlg = new ItemsGridDialog({
											colnumData : colnumData||[],
											// dataKey : "frozenColumnsRight",
											title : '快速查询条件'
										});
							
								dlg.set("columns", getGridColunm(_self, dlg,"QueryItem"));
								// dlg.setBindControl(_self)
								dlg.on("close", function(data) {
											_self.setControlAttr("quicks",
															data);
										});
								dlg.show();
							}

						},
						"advances" : {
							onClick : function() {
								var _self = this;
								var colnumData = _self.get("advances");
								var dlg = new ItemsGridDialog({
											colnumData : colnumData||[],
											// dataKey : "frozenColumnsRight",
											title : '快速查询条件'
										});
							
								dlg.set("columns", getGridColunm(_self, dlg,"QueryItem"));
								// dlg.setBindControl(_self)
								dlg.on("close", function(data) {
											_self.setControlAttr("advances",
															data);
										});
								dlg.show();
							}

						}
					}
				},

				Panel : {
					superClass : "BaseComponent",
					attrs : {
						form : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							value : 'false',
							name : '是否表单面板',
							group:"行为"
						},
						formId : {
							editor : 'text',
							name : '表单id',
							group:"杂项"
						},
						bottom : {

							name : '底部坐标',
							group:"布局"
						},
						dock : {
							value : 'none',
							editor : {
								type : "combobox",
								options : {
									data : [{
												id : "none",
												name : "none"
											}, {
												id : "top",
												name : "top"
											}, {
												id : "bottom",
												name : "bottom"
											}, {
												id : "left",
												name : "left"
											}, {
												id : "right",
												name : "right"
											}, {
												id : "center",
												name : "center"
											}, {
												id : "middle",
												name : "middle"
											}, {
												id : "width",
												name : "width"
											}, {
												id : "height",
												name : "height"
											}, {
												id : "fill",
												name : "fill"
											}]
								}
							},
							name : '停靠类型',
							group:"布局"
						},
						flex:{
							editor : 'number',
							name : '占位比例',
							group:"布局"
							
						},
						layout : {

							editor : {
								type : "combobox",
								options : {
									/*afterSelected:function(){
										
										alert("dfdf")
									},*/
									data : [{
												id : "",
												name : "none"
											}, {
												id : "border",
												name : "border"
											}, {
												id : "vbox",
												name : "vbox"
											}, {
												id : 'absolute',
												name : 'absolute'
											}]
								}
							},
							name : '布局',
							group:"布局"
						},
						paddings : {
							editor : 'text',
							name : '面板内间距',
							group:"外观"
						},
						margins : {
							editor : 'text',
							name : '面板外间距',
							group:"外观"
						},
						title : {
							editor : 'text',
							name : '标题',
							group:"外观"
						},
						cls : {
							editor : 'text',
							name : '样式',
							group:"外观"
						},
						headerCls : {
							editor : 'text',
							name : '头部样式',
							group:"外观"
						},
						bodyCls : {
							editor : 'text',
							name : '内容体样式',
							group:"外观"
						},
						/* href: null, */
						border : {
							name : '是否显示边框',
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								},
								value : 'false'
							},
							dataType : "Boolean",
							group:"外观"
						},

						noheader : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '是否显示标题头',
							group:"外观"
						},

						collapsible : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '是否可收缩',
							group:"外观"
						},

						minimizable : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '是否最小化',
							group:"行为"
						},

						maximizable : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '是否最大化',
							group:"行为"
						},

						closable : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '是否可关闭',
							group:"行为"
						},

						collapsed : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '收缩状态',
							group:"行为"
						},

						minimized : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '最小化状态',
							group:"行为"
						},

						maximized : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							name : '最大化状态',
							group:"行为"
						}

					},
					attrDefaultValue : {
						height : 100,
						width : 200,
						type : 'panel',
						isCustom : false,
						autoLayout : true,
						border : false
					},
					privateAttrs : [ "form", "headerCls",
							"maximizable", "noheader", "border", "paddings",
							"margins", "layout", "bodyCls", "collapsible",
							"minimizable", "closable", "collapsed",
							"minimized", "maximized"]
				},

				FormPanel : {
					superClass : 'Panel',
					attrDefaultValue : {
						type : 'formpanel'
					},
					attrs : {
						loadUrl : {
							editor : 'text',
							name : '请求地址',
							group:"数据"
						},
						action : {
							editor : 'text',
							name : '数据提交地址',
							group:"数据"
						},
						opState : {
							editor : 'text',
							name : '表单状态',
							group:"外观"
						}
					}
				},
				JqGrid : {
					superClass : 'Grid',
					attrDefaultValue : {
						type : 'jqgrid'
					}
				},
				Grid : {
					superClass : 'Panel',
					attrDefaultValue : {
						type : 'grid',
						columns : [{
									title : '列1',
									field : 'column1',
									width : 100
								}, {
									title : '列2',
									field : 'column2',
									width : 200
								}, {
									title : '列3',
									field : 'column3',
									width : 200
								}],
						height : '300',
						width : '400'
					},
					/**
					 * 要加载数据的url，也可以通过action设置
					 * 
					 * @memberof grid
					 * @property {Url} [url] url数据源
					 */
					attrs : {
						url : {
							editor : 'text',
							name : '请求地址',
							group:"数据"
						},
						/**
						 * 网格的标题
						 * 
						 * @memberof grid
						 * @property {String|Number} [title] 网格标题
						 */
						title : {
							editor : 'text',
							name : '标题',
							group:"外观"
						},
						/**
						 * 斑马条纹
						 * 
						 * @memberof grid
						 * @property {Boolean} [striped=true] 斑马条纹
						 */
						striped : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							dataType : "Boolean",
							value : "true",
							name : '显示分割线',
							group:"外观"
						},
						/**
						 * 工具条最大高度(px)
						 * 
						 * @memberof grid
						 * @property {Number} [toolbarHeight=33] 工具条最大高度
						 */
						toolbarHeight : {
							editor : 'text',
							name : '工具条最大高度',
							value : "33",
							group:"外观"
						},

						/**
						 * 表格主键
						 * 
						 * @memberof grid
						 * @property {String} [idField=id] 表格主键
						 */
						idField : {
							editor : 'text',
							name : '表格主键',
							value : "id",
							group:"数据"
						},
						/**
						 * 分组汇总的信息
						 * 
						 * <PRE>
						 * group.show 是否显示分组头 
						 * group.items 分组信息
						 * group.items.field 分组的字段
						 * group.items.order 排序方式可选值：
						 *  	 	ace: 升序
						 *  	 	desc：降序
						 * group.template 主视图模板
						 * </PRE>
						 * <PRE>
						 * group.summary 合计值选项
						 * group.summary.items 合计的字段
						 * group.summary.items.field 合计的字段
						 * group.summary.items.type 合计类型可选值：
						 *  	 	sum: 合计值
						 *  	 	avg：平均值
						 *  	 	min：最小值
						 *  	 	max：最大值
						 *  	 	count：计数值
						 * group.summary.items.value 要输出的值
						 * group.summary.method 计算的函数，如果函数为空，则使用分组数据进行替换模板
						 * group.summary.template 主视图模板
						 * </PRE>
						 * 
						 * @memberof grid
						 * @property {Object} [group] 分组汇总
						 * @property {Boolean} [group.show=true] 是否显示分组头
						 * @property {Array<Object>} [group.items] 分组信息
						 * @property {String} group.items.field 分组的字段
						 * @property {String} [group.items.order=ace] 排序方式
						 * @property {Template} [group.template] 主视图模板
						 * @property {Object} [group.summary] 汇总信息
						 * @property {Array<Object>} [group.summary.items]
						 *           汇总项信息
						 * @property {String} group.summary.items.field 汇总的字段
						 * @property {String} group.summary.items.type 汇总类型
						 * @property {String} [group.summary.items.value] 要输出的值
						 * @property {Object} [group.summary.method] 分组小计的计算函数
						 * @property {Template} [group.summary.template] 主视图模板
						 */
						// group: null,
						/**
						 * 跟随滚动
						 * 
						 * <PRE>
						 * 默认all
						 * 可选值
						 * none 不跟随
						 * header 网格头
						 * footer 网格尾
						 * all 网格头和网格尾
						 * </PRE>
						 * 
						 * @memberof grid
						 * @property {String} [follow=all] 表头/尾跟随
						 */
						follow : {
							name : '跟随滚动',
							editor : {
								type : "combobox",
								options : {
									data : [{
												id : "all",
												name : "网格头和网格尾"
											}, {
												id : "none",
												name : "不跟随"
											}, {
												id : "footer",
												name : "网格尾"
											}]
								}
							},
							value : 'all',
							group:"外观"
						},
						/**
						 * 是否列标题栏的对齐方式跟随
						 * 
						 * @todo 当结果为false时，标题头居中
						 * @todo 当结果为true时，标题头与列的对齐方式相同
						 * @memberof grid
						 * @property {Boolean} [halign=false] 列标题栏的对齐方式跟随
						 */
						halign : {
							editor : {
								type : "combobox",
								options : {
									data : [{
												id : "false",
												name : "标题头居中"
											}, {
												id : "true",
												name : "标题头与列的对齐方式相同"
											}]
								}
							},
							dataType : "Boolean",
							name : '列标题对齐',
							value : 'false',
							group:"外观"
						},
						/**
						 * 是否显示复选框
						 * 
						 * @memberof grid
						 * @property {Boolean} [checkbox=false] 是否显示复选框
						 */
						checkbox : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							dataType : "Boolean",
							value : 'false',
							name : '是否显示复选框',
							group:"行为"
						},
						/**
						 * 是否显示单选框
						 * 
						 * @memberof grid
						 * @property {Boolean} [radiobox=false] 是否显示单选框
						 */
						radiobox : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							value : 'false',
							dataType : "Boolean",
							name : '是否显示单选框',
							group:"行为"
						},
						/**
						 * 是否允许多列排序
						 * 
						 * @memberof grid
						 * @property {Boolean} [multiSort=false] 多列排序
						 */
						multiSort : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							dataType : "Boolean",
							value : 'false',
							name : '是否允许多列排序',
							group:"行为"
							
						},
						/**
						 * 是否远程排序
						 * 
						 * @memberof grid
						 * @property {Boolean} [remoteSort=false] 远程排序
						 */
						remoteSort : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							value : 'false',
							name : '远程排序',
							group:"行为"
						},
						/**
						 * 行号
						 * 
						 * <PRE>
						 * 默认none
						 * 可选值
						 * none : 不显示
						 * normal : 普通
						 * repeat : 重复
						 * </PRE>
						 * 
						 * @memberof grid
						 * @property {String} [rownumbers='none'] 行号
						 */
						rownumbers : {
							editor : {
								type : "combobox",
								options : {
									data : [{
												id : "none",
												name : "不显示"
											}, {
												id : "normal",
												name : "普通"
											}, {
												id : "repeat",
												name : "重复"
											}]
								}
							},
							name : '行号',
							value : 'none',
							group:"外观"
						},
						/**
						 * 分页
						 * 
						 * <PRE>
						 * 默认'none'
						 * 可选值
						 * none: 不分页
						 * up: 上分页
						 * down: 下分页
						 * all: 上下分页
						 * </PRE>
						 * 
						 * @memberof grid
						 * @property {String} [pager=none] 分页
						 */
						pager : {
							editor : {
								type : "combobox",
								options : {
									data : [{
												id : "none",
												name : "不分页"
											}, {
												id : "up",
												name : "上分页"
											}, {
												id : "down",
												name : "下分页"
											}, {
												id : "all",
												name : "上下分页"
											}]
								}
							},
							name : '分页条位置',
							value : 'none',
							group:"外观"
						},
						/*       *//**
									 * 当上分页是否与工具栏同行，false则与标题栏同行
									 * 
									 * @memberof grid
									 * @property {Boolean} [pagerToolbar=true]
									 *           工具栏分页
									 */
						/*
						 * pagerToolbar: true,
						 */

						/**
						 * 主视图列
						 * 
						 * @memberof grid
						 * @property {Array<Array>} [columns] 主视图列
						 */
						columns : {
							name : '列信息',
							editor : {
								type : 'button'
							},
							group:"杂项"
						},
						toolbar : {
							name : '工具栏',
							editor : {
								type : 'button'
							},
							group:"杂项"
						},
						/**
						 * 左固定列
						 * 
						 * @memberof grid
						 * @property {Array<Array>} [frozenColumns] 左固定列
						 */
						frozenColumns : {
							name : '左固定列',
							editor : {
								type : 'button'
							},
							group:"杂项"
						},
						/**
						 * 右视图列
						 * 
						 * @memberof grid
						 * @property {Array<Array>} [frozenColumnsRight] 右视图列
						 */
						frozenColumnsRight : {
							name : '右视图列',
							editor : {
								type : 'button'
							},
							group:"杂项"
						},
						/**
						 * 是否对编辑过的数据进行标记
						 * 
						 * @memberof grid
						 * @property {Boolean} [markChange=false] 不标记
						 */
						markChange : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							dataType : "Boolean",
							value : 'false',
							name : '是否对编辑过',
							group:"行为"
						},
						/**
						 * 网格是否可编辑的总开关
						 * 
						 * @memberof grid
						 * @property {Boolean} [editable=true] 可编辑
						 */
						/*editable : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							dataType : "Boolean",
							value : 'false',
							name : '网格是否可编辑',
							group:"行为"
						},*/

						/**
						 * 初始查询参数
						 * 
						 * <PRE>
						 * 已用关键字：page、rows、sort、order、__transor
						 * </PRE>
						 * 
						 * @memberof grid
						 * @property {Object} [queryParams] 查询参数
						 */
						queryParams : {
							name : '查询参数',
							group:"数据"
						},
						/*	*//**
								 * 自定义面板的jquery表达式
								 * 
								 * <PRE>
								 * 组件根据 $A(headerCustom) 取得面板 eg. #query
								 * </PRE>
								 * 
								 * @memberof grid
								 * @property {String} [headerCustom] jquery表达式
								 */
						/*
						 * headerCustom: null,
						 */
						/**
						 * 初始化网格时 自动加载数据
						 * 
						 * @memberof grid
						 * @property {Boolean} [autoLoad=true] 标志
						 */
						autoLoad : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							value : 'true',
							dataType : "Boolean",
							name : '自动加载数据',
							group:"行为"
						},

						fitColumns : {
							editor : {
								type : "combobox",
								options : {
									data : [{
												id : "none",
												name : "不自适应"
											}, {
												id : "ES",
												name : "列宽进行伸长"
											}, {
												id : "E",
												name : "填充满表格"
											}]
								}
							},
							name : '自适应填充宽度',
							value : 'E',
							group:"行为"
						},
						/**
						 * 自定义合计栏的配置
						 * 
						 * <PRE>
						 * summary.method 计算的函数，如果函数为空，则使用网格的data进行替换模板
						 * summary.template 模板
						 * </PRE>
						 * 
						 * @property {Object} [summary] 自定义合计栏的配置
						 * @property {Function} [summary.method] 合计的计算方法
						 * @property {template} summary.template 模板
						 * @memberof grid
						 */
						// summary: null,
						/**
						 * 合计栏所在位置 可选值 top bottom
						 * 
						 * @property {String} [summaryPos=bottom] 合计栏所在位置
						 * @memberof grid
						 */
						// summaryPos: 'bottom',
						/**
						 * 网格列是否可以调整宽度
						 * 
						 * <PRE>
						 * 1、默认为'true'，可以调整列宽
						 * </PRE>
						 * 
						 * @property {Boolean} [columnResizable=true] 允许调整列宽
						 * @memberof grid
						 */
						columnResizable : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							dataType : "Boolean",
							value : 'true',
							name : '是否可以调整宽度',
							group:"行为"
						},
						/**
						 * 是否点击数据行开始编辑
						 * 
						 * @memberof grid
						 * @property {Boolean} [autoBeginEdit=true] 开始编辑
						 */
						autoBeginEdit : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							dataType : "Boolean",
							value : 'true',
							name : '是否点击数据行开始编辑',
							group:"行为"
						},
						/**
						 * 是否点击非数据行结束编辑
						 * 
						 * @memberof grid
						 * @property {Boolean} [autoEndEdit=true] 结束编辑
						 */
						autoEndEdit : {
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							dataType : "Boolean",
							value : 'true',
							name : '是否点击非数据行结束编辑',
							group:"行为"
						}
						/**
						 * 是否使用编辑器的代理删除按钮 该参数在有编辑器的情况下生效
						 * 
						 * @memberof grid
						 * @property {Boolean} [editorDelBtn=true] 使用
						 */
						// editorDelBtn: true,
						/**
						 * 要合并的列名
						 * 
						 * @memberof grid
						 * @property {Array<String>} [mergeColumns] 要自动合并的列
						 */
						// mergeColumns: null,
						/**
						 * 是否允许进行列的隐藏/显示操作
						 * 
						 * @memberof grid
						 * @property {Boolean} [managerColumn=true] 允许
						 */
						// managerColumn: true
					},

					attrEvents : {
						"toolbar":{
							onClick : function() {
								var _self = this;

								var buttons = _self.get("toolbar");

								var dlg = new TreeGridDialog({
											colnumData : buttons,
											 dataKey : "toolbar",
											title : '工具栏',
											dataReader : {
												idField : 'id',
												treeField : 'id',
												newDataTpl : {
													id : "btn",
													field : "name"
												}
											}
										});
						
								dlg.set("columns", [{
													title : '按钮id',
													field : "id",
													width : 100,
													editor : 'text'
												}, {
													title : '按钮名称',
													field : "text",
													width : 200,
													editor : 'text'
												}, {
													title : 'iconCls',
													field : "iconCls",
													width : 100,
													editor : 'text'
												}, {
													title : '事件',
													field : "handler",
													width : 400,
													editor : 'text'
												}]);
							dlg.on("close", function(data) {
									_self.setControlAttr("toolbar", data);
								});
								dlg.show();
							}
							}
							
						,
						"columns" : {
							onClick : function() {
								var _self = this;
								var colnumData = _self.get("columns");
								var dlg = new TreeGridDialog({
											dataKey : "columns",
											title : '网格列设置'
										});

								dlg.set("columns", getGridColunm(_self, dlg,"Column"));
								dlg.setBindControl(_self)
								dlg.show();
							}

						},
						frozenColumns : {
							onClick : function() {
								var _self = this;
								var colnumData = _self.get("frozenColumns");
								var dlg = new TreeGridDialog({
											colnumData : colnumData,
											// dataKey : "frozenColumnsRight",
											title : '右网格列设置'
										});

								dlg.set("columns", getGridColunm(_self, dlg,"Column"));
								// dlg.setBindControl(_self)
								dlg.on("close", function(data) {
									_self.setControlAttr("frozenColumns", data);
								});
								dlg.show();
							}
						},
						frozenColumnsRight : {
							onClick : function() {
								var _self = this;
								var colnumData = _self
										.get("frozenColumnsRight");
								var dlg = new TreeGridDialog({
											colnumData : colnumData,
											// dataKey : "frozenColumnsRight",
											title : '右网格列设置'
										});

								dlg.set("columns", getGridColunm(_self, dlg,"Column"));
								// dlg.setBindControl(_self)
								dlg.on("close", function(data) {
											_self.setControlAttr(
													"frozenColumnsRight", data);
										});
								dlg.show();
							}
						}
					}

				},
				Column : {
					attrEvents : {
						"editOptions" : {
							onClick : function(parentDlg) {
								var editIndex=$('#' + parentDlg.gridId).data("editIndex");
								var _self = this;
								$('#' + parentDlg.gridId).treegrid('endEdit', editIndex);
								var node = $("#" + parentDlg.gridId)
										.treegrid('getSelected');
										
							
								if (node.fieldType) {

									var propertyDialog = new PropertyDialog({

										title : '编辑框属性设置'
											// dataKey : "columns",

											// columns :
											// getGridColunm(_self)
										});
									var propertyData = node.editOptions;
									var editorType = node.fieldType;
									if (colnumEditorAttConfig[editorType]) {
										var propertyKey = colnumEditorAttConfig[editorType];
										var isEditorTypeChange=false;
										if (propertyData["fieldType"]!=editorType){
											isEditorTypeChange=true;
											propertyData["fieldType"]=editorType;
										}
										var type="";
										var propertys = getControlAttrs(
												propertyKey, _self,
												propertyDialog);
										if (propertyData) {
											for (var i = 0; i < propertys.length; i++) {
												if (propertyData[propertys[i].id]) {
													
													if (propertys[i].id=="type"&&isEditorTypeChange){
														propertys[i].id.value=propertys[i].id.value;
													}else{
														propertys[i].value = propertyData[propertys[i].id];
													}
												}
											}

										};
										
										propertyDialog.set("propertyData",
												propertys);
										propertyDialog.on("close", function(
														data) {
													node.editOptions = $
															.extend(
																	true,
																	node.editOptions,
																	data)

												})
										propertyDialog.show();
									}
								}
							}
						},
						"buttons" : {
							onClick : function(parentDlg) {
								var node = $("#" + parentDlg.gridId)
										.treegrid('getSelected');
								var buttons = node["buttons"];
								var _self = this;

								var dlg = new TreeGridDialog({
											colnumData : buttons,
											// dataKey : "columns",
											title : '操作列按钮设置',
											dataReader : {
												idField : 'id',
												treeField : 'id',
												newDataTpl : {
													id : "btn",
													field : "name"
												}
											}
										});
								// id="del" name="删除" icon="btn-delete"
								// iconMode="ONLYICON"
								// handle="hbill.deleteLineGrid2('${id}')"
								dlg.set("columns", [{
													title : '按钮id',
													field : "id",
													width : 100,
													editor : 'text'
												}, {
													title : '按钮名称',
													field : "text",
													width : 200,
													editor : 'text'
												}, {
													title : 'iconCls',
													field : "iconCls",
													width : 100,
													editor : 'text'
												}, {
													title : '事件',
													field : "handler",
													width : 400,
													editor : 'text'
												}]);
								dlg.on("close", function(data) {
											node["buttons"] = data;
										});
								// dlg.setBindControl(_self)
								dlg.show();
							}

						}
					},
					attrs : {
						/**
						 * 列属性
						 * 
						 * @property {String} field 列属性
						 * @memberof gridColumn
						 */
						field : {
							editor : 'text',
							width : 100,
							title : '列属性'
						},
						/**
						 * 列标题
						 * 
						 * <PRE>
						 * 操作列配置按钮，title配置为数字，该数字代表buttons的索引，且按钮不加入数据域
						 * </PRE>
						 * 
						 * @property {String} title 列标题
						 * @memberof gridColumn
						 */
						title : {
							editor : 'text',
							width : 100,
							title : '列标题'
						},
						/**
						 * 合并列
						 * 
						 * @property {Number} [colspan] 合并列
						 * @memberof gridColumn
						 */
						colspan : {
							width : 100,
							editor : 'text',
							title : '合并列'
						},
						/**
						 * 合并行
						 * 
						 * @property {Number} [rowspan] 合并行
						 * @memberof gridColumn
						 */
						rowspan : {
							width : 100,
							editor : 'text',
							title : '合并行'
						},
						/**
						 * 宽度
						 * 
						 * @property {Number} [Column.width=100] 宽度
						 * @memberof gridColumn
						 */
						width : {
							width : 100,
							editor : 'text',
							title : '宽度',
							value:100
						},
						/**
						 * 隐藏
						 * 
						 * @property {Number} [Column.hidden=false] 隐藏
						 * @memberof gridColumn
						 */
						hidden : {
							width : 100,
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							title : '是否隐藏',
							value : "false",
							dataType : "Boolean"
						},
						/**
						 * 对齐方式 可选值 center left right
						 * 
						 * @property {String} [Column.align=center] 对齐方式
						 * @memberof gridColumn
						 */
						align : {
							title : '跟随滚动',
							width : 100,
							editor : {
								type : "combobox",
								options : {
									data : [{
												id : "center",
												name : "center"
											}, {
												id : "left",
												name : "left"
											}, {
												id : "right",
												name : "right"
											}]
								}
							},
							dataType : "Boolean",
							value : 'center'
						},
						/**
						 * 可排序
						 * 
						 * @property {Boolean} [sortable=false] 对齐方式
						 * @memberof gridColumn
						 */
						sortable : {
							width : 100,
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							title : '是否可排序',
							value : "false",
							dataType : "Boolean"
						},
						/*   *//**
								 * 自定义排序函数，用来做局部排序
								 * 
								 * @property {Function} [sorter] 排序函数
								 * @property {Object} sorter.a 第一个值
								 * @property {Object} sorter.b 第二个值
								 *           @example
								 *           {title: '自定义排序方法',align:'right',field: 'f3', 
						 * &#9;sortable:true,
						 * &#9;sorter: function(a,b){
						 * &#9;&#9;return a.f3 - b.f3;
						 * &#9;}
						 * }
								 * @memberof gridColumn
								 */
						/*
						 * sorter: null,
						 */
						/**
						 * 返回样式字符串定制的单元格样式的函数
						 * 
						 * @property {Function} [styler] 样式函数
						 * @property {String} styler.val 值
						 * @property {Object} styler.row 行数据对象
						 * @property {index} styler.i 行号
						 *           @example
						 *           {title: '样式修改列',field: 'f2',
						 * &#9;styler:function(val,row,i){
						 * &#9;&#9;var n = parseInt(val.substr(val.lastIndexOf('-')+1));
						 * &#9;&#9;if(n%2==1){
						 * &#9;&#9;&#9;return 'color:green;';
						 * &#9;&#9;}else{
						 * &#9;&#9;&#9;return 'color:red;';
						 * &#9;&#9;}
						 * &#9;}
						 * }
						 * @memberof gridColumn
						 */
						styler : {
							width : 100,
							editor : 'text',
							title : '列样式'
						},
						/**
						 * 格式化配置
						 * 
						 * <PRE>
						 * 函数类型：
						 * 该函数接收选中三个参数，分别为该单元格的值，行实体对象，行号。函数返回一个字符串作为显示值
						 * 字符串类型：
						 * 指定一个实体的属性 
						 * 表达式类型：
						 * 使用{}包裹字段并使用实体进行替换
						 * </PRE>
						 * 
						 * @property {Function|String} [styler] 格式化函数
						 * @property {String} styler.val 值
						 * @property {Object} styler.row 行数据对象
						 * @property {index} styler.i 行号
						 *           @example
						 *           {title: '格式化显示列',align:'left',field: 'f1',
						 * &#9;formatter:function(val,row,i){
						 * &#9;&#9;return '格式化列';
						 * &#9;}
						 * }
						 *           @example
						 *           {title: 'f1显示f2的值',align:'left',field:
						 *           'f1', formatter:'f2'}
						 *           @example
						 *           {title: 'f1显示f2的值',align:'left',field: 'f1', formatter:'{f1}-{f2}'}
						 * @memberof gridColumn
						 */
						formatter : {
							width : 100,
							editor : 'text',
							title : '格式化配置'
						},
						
						editable:{
							width : 100,
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							title : '是否可编辑',
							value : "false",
							dataType : "Boolean"
						},
						/**
						 * 编辑器设置
						 * 
						 * @property {Object} [editor] 格式化函数
						 * @property {String} editor.type 编辑器类型
						 * @property {Object} editor.options 编辑器初始化属性[详见个组件]
						 *           @example {
						 * &#9;title : '主列标题2',
						 * &#9;field : 'c2',
						 * &#9;width : 120,
						 * &#9;editor : {
						 * &#9;&#9;type : 'combogrid',
						 * &#9;&#9;options : {
						 * &#9;&#9;&#9;panelwidth: 400,
						 * &#9;&#9;&#9;url: 'platform/sample/base/ui/combogridData.do',
						 * &#9;&#9;&#9;&#9;columns: [[
						 * &#9;&#9;&#9;&#9;{title: 'id列',field: 'id',hidden:true},
						 * &#9;&#9;&#9;&#9;{title: '名称列',field: 'name',width: 100},
						 * &#9;&#9;&#9;&#9;{title: '主列标题3',field: 'c3',width: 150},
						 * &#9;&#9;&#9;&#9;{title: '主列标题4',field: 'c4',width: 200},
						 * &#9;&#9;&#9;&#9;{title: '主列标题5',field: 'c5',width: 250},
						 * &#9;&#9;&#9;&#9;{title: '主列标题6',field: 'c6',width: 500}
						 * &#9;&#9;&#9;]]
						 * &#9;&#9;}
						 * &#9;}
						 * }
						 * @memberof gridColumn
						 */
						fieldType : {
							width : 100,
							editor : {
								type : "combobox",
								options : {
									data : [{
												id : "",
												name : ""
											},{
												id : "textbox",
												name : "textbox"
											},
											{
												id : "textfield",
												name : "textfield"
											}
											, {
												id : "number",
												name : "number"
											}, {
												id : "money",
												name : "money"
											}, {
												id : "datetime",
												name : "datetime"
											}, {
												id : "combobox",
												name : "combobox"
											}, {
												id : "combogrid",
												name : "combogrid"
											}, {
												id : "comboztree",
												name : "comboztree"
											}]
								}
							},
							title : '编辑框类型'
						},
						editOptions : {
							width : 100,
							editor : {
								type : "button"
							},
							title : '编辑框属性'
						},
						buttons : {
							width : 100,
							title : "操作按钮",
							editor : {
								type : "button"
							}
						},
						/**
						 * 行按钮过滤器
						 * 
						 * <PRE>
						 * 函数类型
						 * ：
						 * 该函数接收两个参数，分别为当前行实体对象，行号。函数返回布尔行数组
						 * 该数组描述行按钮是否显示 true为显示
						 * </PRE>
						 * 
						 * @property {Function} [btnsFilter] 行按钮的过滤器
						 * @memberof gridColumn
						 */
						// btnsFilter : null,
						/**
						 * 数据列是否提示浮动的title
						 * 
						 * @property {Boolean} [showTitle=false] 标志
						 * @memberof gridColumn
						 */
						showTitle : {
							width : 100,
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							dataType : "Boolean",
							title : '是否提示浮动的标题',
							value : "false"
						},
						/**
						 * 合计值选项
						 * 
						 * <PRE>
						 * summary.type 可选值：
						 *  	 	sum: 合计值
						 *  	 	avg：平均值
						 *  	 	min：最小值
						 *  	 	max：最大值
						 *  	 	count：计数值
						 * summary.value 要输出的值
						 * </PRE>
						 * 
						 * @property {Object} [summary] 合计值选项
						 * @property {String} [summary.type] 类型
						 * @property {String} [summary.value] 值
						 * @memberof gridColumn
						 */
						summary : {
							width : 100,
							title : "合计设置"
						},
						/**
						 * 网格列是否可以调整宽度
						 * 
						 * @property {Boolean} [resizable=true] 允许调整列宽
						 * @memberof gridColumn
						 */
						resizable : {
							width : 100,
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							title : '是否可以调整宽度',
							dataType : "Boolean",
							value : "false"
							
						},
						/**
						 * 是否为行头
						 * 
						 * @property {Boolean} [rowHeader=false] 不是行头
						 * @memberof gridColumn
						 */
						rowHeader : {
							width : 100,
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							dataType : "Boolean",
							title : '是否为行头',
							value : "false"
						},
						/**
						 * 是否作为 列隐藏/显示树 的节点
						 * 
						 * @property {Boolean} [showTree=true] 允许
						 * @memberof gridColumn
						 */
						showTree : {
							width : 100,
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							dataType : "Boolean",
							title : ' 是否显示下拉',
							value : "false"
						},
						/**
						 * 是否锁定列隐藏/显示操作，锁定将不允许用户进行列的隐藏/显示操作
						 * 
						 * @property {Boolean} [lockTree=false] 允许
						 * @memberof gridColumn
						 */
						lockTree : {
							width : 100,
							editor : {
								type : 'checkbox',
								options : {
									on : 'true',
									off : 'false'
								}
							},
							dataType : "Boolean",
							title : ' 是否锁定列',
							value : "false"
						}
					}
				},

				Tab : {
					superClass : 'Panel',
					attrs : {
						actionTab : {
							value : 0,
							name : '当前活动页',
							group:"杂项"
						},
						items : {
							name : 'tab项',
							editor : {
								type : 'button'
							},
							group:"杂项"
						},
						autoCtreateTab : {
							value : true,
							name : '是否自动创建',
							group:"杂项"
						}
					},
					attrDefaultValue : {
						actionTab : 0,
						dock : "width",
						type : 'tabpanel'
					},
					attrEvents : {
						items : {
							onClick : function() {

								var colnumData = this.getAttrData();

								var dlg = new ItemsGridDialog({
											colnumData : colnumData.items,
											columns : [{
														field : "title",
														editor : "text",
														title : "tab标题",
														width : 200
													}]
										});
								dlg.on("close", function(data, insertData,
												deleteData, upDateData) {

											console.log(arguments)

										})
								dlg.show();
							}
						}

					}
				}
			};

			colnumEditorAttConfig = {
				textbox : "Textbox",
				money : "Money",
				number : "Number",
				combobox : "Combobox",
				comboztree : "Comboztree",
				combogrid : "ComboGrid",
				datetime : "DateTime",
				reference: "Reference"
			}


			var dlgCount = 10000;
			ItemsGridDialog = Widget.extend({
				attrs : {
					colnumData : null,
					columns : [],
					width : 800,
					height : 400,
					dataKey : null
				},
				dialogType : 'datagrid',

				initialize : function(options) {
					dlgCount++;
					this.dlgId = dlgCount;
					ItemsGridDialog.superclass.initialize.call(this, options);

					var dlgHtml = [];
					dlgHtml
							.push('<div style="padding:5px;"> <div id="gridLayout'
									+ this.dlgId
									+ '" data-options="fit:true"><div data-options="region:\'center\',border:false" >');
					var dlgContent = this.createDlgContent()
					dlgHtml.push(dlgContent);
					dlgHtml
							.push('</div> <div data-options="region:\'south\',border:false,height:40" style="height:40px;text-align:right;padding:5px 0 0;"><a id="gridCfgBtn'
									+ this.dlgId
									+ '" style="width:80px">确定</a> <a style="width:80px"  id="gridCanelBtn'
									+ this.dlgId
									+ '">取消</a></div> </div></div>');
					this.$dlg = $(dlgHtml.join(""));

				},
				setBindControl : function(control) {
					this.bindControl = control;
				},
				getBindControl : function() {
					return this.bindControl

				},
				createDlgContent : function() {
					var columns = this.get("columns");
					var gridHtml = [];
					this.gridId = "dg" + this.dlgId;
					gridHtml.push('<table id="' + this.gridId
							+ '" class="easyui-' + this.dialogType
							+ '" style="width:600px;height:350px;">');
					gridHtml.push('<thead><tr>');

					/*$.each(columns, function(index, col) {
								gridHtml.push('<th data-options=\''
										+ JSON.stringify(col) + '\'>'
										+ col["title"] + '</th>');
							});
*/
					gridHtml.push('</tr></thead></table>');
					return gridHtml.join("");
				},
				show : function() {

					
					var dlgHtml = [];
					dlgHtml
							.push('<div style="padding:5px;"> <div id="gridLayout'
									+ this.dlgId
									+ '" data-options="fit:true"><div data-options="region:\'center\',border:false" >');
					var dlgContent = this.createDlgContent()
					dlgHtml.push(dlgContent);
					dlgHtml
							.push('</div> <div data-options="region:\'south\',border:false,height:40" style="height:40px;text-align:right;padding:5px 0 0;"><a id="gridCfgBtn'
									+ this.dlgId
									+ '" style="width:80px">确定</a> <a style="width:80px"  id="gridCanelBtn'
									+ this.dlgId
									+ '">取消</a></div> </div></div>');
					this.$dlg = $(dlgHtml.join(""));
					var _self = this;
					$("body").append(this.$dlg);
					var editIndex = undefined;

					function onClickRow(index) {
						if (editIndex != index) {
							if (endEditing()) {
								$('#' + _self.gridId).datagrid('selectRow',
										index).datagrid('beginEdit', index);
								editIndex = index;
							} else {
								$('#' + _self.gridId).datagrid('selectRow',
										editIndex);
							}
						}
					}
					function endEditing() {
						if (editIndex == undefined) {
							return true
						}
						if ($('#' + _self.gridId).datagrid('validateRow',
								editIndex)) {

							$('#' + _self.gridId)
									.datagrid('endEdit', editIndex);
							editIndex = undefined;
							return true;
						} else {
							return false;
						}
					}
					function append() {
						if (endEditing()) {
							$('#' + _self.gridId).datagrid('appendRow', {});
							editIndex = $('#' + _self.gridId)
									.datagrid('getRows').length
									- 1;

							$('#' + _self.gridId).datagrid('selectRow',
									editIndex).datagrid('beginEdit', editIndex);;
						}
					};
					function removeit() {
						if (editIndex == undefined) {
							return
						}
						$('#' + _self.gridId).datagrid('cancelEdit', editIndex)
								.datagrid('deleteRow', editIndex);
						editIndex = undefined;
					}
					this.$dlg.window({
								maximizable:false,
							
								modal : true,
								title : this.get("title"),
								width : this.get("width"),
								height : this.get("height")
							});
					var toolbar = [{
								text : '新增列',
								iconCls : 'icon-add',
								handler : append
							}, {
								text : '删除列',
								iconCls : 'icon-cut',
								handler : removeit
							}];

					$('#' + _self.gridId, _self.$dlg).datagrid({
								toolbar : toolbar,
								singleSelect : true,
								columns : [this.get("columns")],
								fit : true,
								onClickRow : onClickRow
							});
					var control = this.getBindControl();
					var dataKey = this.get("dataKey");

					var colnumData = this.get("colnumData");
					if (control) {
						colnumData = control.getControlAttr(dataKey);
					}
					// $.extend({},controlAttrs[j],rows[i])
					/*
					 * var data=$.merge( [], control.getControlAttr(dataKey));
					 * data="";
					 */
					// console.log(control.getControlAttr(dataKey))
					$('#' + _self.gridId, _self.$dlg).datagrid("loadData",
							colnumData);
					$('#gridLayout' + this.dlgId, _self.$dlg).layout();
					var _self = this;
					$('#gridCfgBtn' + this.dlgId, _self.$dlg).button({
						onClick : function() {

							endEditing();
							var rows = $('#' + _self.gridId, _self.$dlg)
									.datagrid("getRows");
							var insertData = $('#' + _self.gridId, _self.$dlg)
									.datagrid("getChanges", "inserted");

							var deleteData = $('#' + _self.gridId, _self.$dlg)
									.datagrid("getChanges", "deleted");
							var upDateData = $('#' + _self.gridId, _self.$dlg)
									.datagrid("getChanges", "updated");
							if (control) {
								control.setControlAttr(dataKey, rows);
							}
							_self.trigger("close", rows, insertData,
									deleteData, upDateData);
							_self.$dlg.window('close');
							_self.$dlg.window('destroy');

						}
					});
					$('#gridCanelBtn' + this.dlgId, this.$dlg).button({
						onClick : function() {
							// var control=_self.getBindControl();

							// var rows = $('#'+_self.gridId,
							// $dlg).datagrid("getRows");
							endEditing();
							var rows = $('#' + _self.gridId, _self.$dlg)
									.datagrid("getRows");

							if (control) {
								control.setControlAttr(dataKey, rows);
							}
							var insertData = $('#' + _self.gridId, _self.$dlg)
									.datagrid("getChanges", "inserted");

							var deleteData = $('#' + _self.gridId, _self.$dlg)
									.datagrid("getChanges", "deleted");
							var upDateData = $('#' + _self.gridId, _self.$dlg)
									.datagrid("getChanges", "updated");

							_self.trigger("close", rows, insertData,
									deleteData, upDateData);

							_self.$dlg.window('close');
							_self.$dlg.window('destroy');
						}
					});
					// $dlg.window('open');
				}

			});

			TreeGridDialog = ItemsGridDialog.extend({
				dialogType : 'treegrid',

				attrs : {
					dataReader : {
						idField : 'id',
						treeField : 'field',
						newDataTpl : {
							id : "fieldName",
							field : "fieldName",
							title : "fieldTitle",
							editOptions:{}
						}
					}
				},
				/*
				 * dataReader:{ idField : 'field', treeField : 'field',
				 * newDataTpl:{ id : "fieldName" , field : "fieldName" , title :
				 * "fieldTitle"} },
				 */
				show : function() {
					var dataKey = this.get("dataKey");
					var control = this.getBindControl();
					var colnumData = this.get("colnumData") || [];
					if (control) {
						colnumData = control.getControlAttr(dataKey);
					}
					var _self = this;
					for (var i = 0; i < colnumData.length; i++) {
						var colnum = colnumData[i];
						if (colnum["editor"]) {
							if (typeof colnum["editor"] == "object") {
								if ( colnum["editor"]["fieldType"]){
									colnum.editorType=colnum["editor"]["fieldType"].toUpperCase()
								}

								colnum.editOptions = colnum["editor"];
							}
						}
						colnum._parentId = colnum.parentColumn || -1;
					}
					/*
					 * var rootData=createNewData(); rootData["id"]="-1";
					 * rootData["title"]="s" colnum.colnum
					 */
					var startRowIndex = colnumData.length + 1;
					var $dlg = $(this.$dlg);
					$("body").append($dlg);
					var editIndex = undefined;
					
					function onClickRow(index) {
					
						var row = $('#' + _self.gridId).treegrid('getSelected');
						if (editIndex == undefined) {
							if (row) {
								editIndex = row.id;
								$('#' + _self.gridId).treegrid('beginEdit',
										editIndex);
							}
			
						} else {
							$('#' + _self.gridId)
									.treegrid('endEdit', editIndex);
							editIndex = row.id;
							$('#' + _self.gridId).treegrid('beginEdit',
									editIndex);
						};
						$('#' + _self.gridId).data("editIndex",editIndex)
						// if (editIndex != index) {
						/*
						 * if (endEditing()) {
						 * $('#'+_self.gridId).treegrid('selectRow',
						 * index).treegrid( 'beginEdit', index); editIndex =
						 * index; } else {
						 * $('#'+_self.gridId).treegrid('selectRow', editIndex); }
						 */
						// }
					}
					function endEditing() {
						if (editIndex == undefined) {
							/*
							 * var row =
							 * $('#'+_self.gridId).treegrid('getSelected'); if
							 * (row){ editIndex = row.id;
							 * //$('#'+_self.gridId).treegrid('beginEdit',
							 * editIndex); }
							 */
							return true;
						}
						if ($('#' + _self.gridId).treegrid('validateRow',
								editIndex)) {
							/*
							 * var ed =
							 * $('#'+_self.gridId).datagrid('getEditor',
							 * {index:editIndex,field:'productid'}); var
							 * productname = $(ed.target).combobox('getText');
							 * $('#'+_self.gridId).datagrid('getRows')[editIndex]['productname'] =
							 * productname;
							 */
							$('#' + _self.gridId)
									.treegrid('endEdit', editIndex);
							editIndex = undefined;
							return true;
						} else {
							return false;
						}
					}

					var createNewData = function() {
						var dataReader = _self.get("dataReader");
						startRowIndex++;
						var newData = $.extend(true, {},
								dataReader["newDataTpl"]);
						for (var key in newData) {
							newData[key] = newData[key]
									+ startRowIndex.toString();

						}
						return newData;

					};
					function appendChildNode() {
						var node = $('#' + _self.gridId)
								.treegrid('getSelected');
						if (node) {

							endEditing();
							var appendData = createNewData();
							$('#' + _self.gridId).treegrid('append', {
										parent : node.id,
										data : [appendData]
									});
						}
					}
					function append() {
						// if (endEditing()) {

						var rootNode = $('#' + _self.gridId)
								.treegrid('getRoot');
						endEditing();
						// var node =
						// $('#'+_self.gridId).treegrid('getSelected');
						var appendData = createNewData();
						$('#' + _self.gridId).treegrid('append', {
									parent : "",
									data : [appendData]
								});

						/*
						 * $('#'+_self.gridId).treegrid('appendRow', { });
						 * editIndex = $('#'+_self.gridId)
						 * .treegrid('getRows').length - 1;
						 * 
						 * $('#'+_self.gridId).treegrid('selectRow', editIndex)
						 * .treegrid('beginEdit', editIndex);;
						 */
						// }
					};

					function move(isUp) {
						var node = $('#' + _self.gridId)
								.treegrid('getSelected');
						if (node) {
							var id = node.id;
							var nodeTr = $("tr[node-id=\"" + id + "\"]");
							var nodeData;

							if (isUp) {
								var prevId = nodeTr.prev().attr("node-id");
								nodeData = $('#' + _self.gridId).treegrid(
										'pop', node.id);
								$('#' + _self.gridId).treegrid('insert', {
											before : prevId,
											data : nodeData
										});
							} else {
								var nextId = nodeTr.next().attr("node-id");
								nodeData = $('#' + _self.gridId).treegrid(
										'pop', node.id);
								$('#' + _self.gridId).treegrid('insert', {
											after : nextId,
											data : nodeData
										});
							};

						};

					};

					function removeit() {
						if (editIndex == undefined) {
							return
						}
						$('#' + _self.gridId).treegrid('cancelEdit', editIndex)
								.treegrid('deleteRow', editIndex);
						editIndex = undefined;
					}
					$dlg.window({
								modal : true,
								title : this.get("title"),
								width : this.get("width"),
								height : this.get("height")
							});

					var toolbar = [{
								text : '新增列',
								// iconCls : 'icon-add',
								handler : append
							}, {
								text : '新增子列',
								// iconCls : 'icon-add',
								handler : appendChildNode
							}, {
								text : '删除列',
								// iconCls : 'icon-cut',
								handler : removeit
							}, {
								text : '上移',
								// iconCls : 'icon-cut',
								handler : function() {
									move(true);

								}
							}, {
								text : '下移',
								// iconCls : 'icon-cut',
								handler : function() {
									move(false);

								}
							}

					];
					var dataReader = _self.get("dataReader")

					$('#' + _self.gridId, $dlg).treegrid({
								toolbar : toolbar,
								columns : [this.get("columns")],
								// fitColumns:true,
								singleSelect : true,
								fit : true,
								idField : dataReader["idField"],
								treeField : dataReader["treeField"],
								onClickRow : onClickRow
							});

					// $.extend({},controlAttrs[j],rows[i])
					/*
					 * var data=$.merge( [], control.getControlAttr(dataKey));
					 * data="";
					 */
					if (colnumData != null) {

						$('#' + _self.gridId, $dlg).treegrid("loadData",
								colnumData);
					} else {
						alert("数据空")
					}

					$('#gridLayout' + this.dlgId, $dlg).layout();
					var _self = this;
					$('#gridCfgBtn' + this.dlgId, $dlg).button({
						onClick : function() {

							endEditing();
							var rows = $('#' + _self.gridId, $dlg)
									.treegrid("getData");

							for (var i = 0; i < rows.length; i++) {
								var data = rows[i];
								for(var key in data){
									if (data[key]==""){
										delete data[key];
									}
								}
								if (data.fieldType){
									data["editor"] = $.extend(true,
											data.editOptions, {
												fieldType : data.fieldType.toLowerCase()
											});
								}else{
									if (data.editorType){
										data["editor"] = $.extend(true,
												data.editOptions, {
													fieldType : data.editorType.toLowerCase()
												});
									}
										
								}
								/*if (!data.fieldType&&data.editorType) {
									data["editor"] = $.extend(true,
											data.editOptions, {
												fieldType : data.editorType.toLowerCase()
											});

								}else if (data.fieldType){
									data["editor"] = $.extend(true,
											data.editOptions, {
												fieldType : data.fieldType
											});
								}*/

							}

							if (control) {
								control.setControlAttr(dataKey, rows);
							}
							_self.trigger("close", rows);
							$dlg.window('close');
							$dlg.window('destroy');

						}
					});
					$('#gridCanelBtn' + this.dlgId, $dlg).button({
						onClick : function() {
							var control = _self.getBindControl();
							for (var i = 0; i < colnumData.length; i++) {
								var data = colnumData[i];
								
								for(var key in data){
									if (data[key]==""){
										delete data[key];
									}
								}
								if (data.fieldType){
									data["editor"] = $.extend(true,
											data.editOptions, {
												fieldType : data.fieldType.toLowerCase()
											});
								}else{
									if (data.editorType){
										data["editor"] = $.extend(true,
												data.editOptions, {
													fieldType : data.editorType.toLowerCase()
												});
									}
										
								}

							}
							// var rows = $('#'+_self.gridId,
							// $dlg).datagrid("getRows");
							if (control) {
								control.setControlAttr(dataKey, colnumData);
							}
							_self.trigger("close", colnumData);
							$dlg.window('close');
							$dlg.window('destroy');
						}
					});
					// $dlg.window('open');
				}

			});

			PropertyDialog = ItemsGridDialog.extend({
						attrs : {
							width : 800,
							height : 400,
							dataKey : null,
							propertyData : null,
							callBack : function() {
							}
						},
						initialize : function(options) {

							PropertyDialog.superclass.initialize.call(this,
									options);
						},
						dialogType : 'propertygrid',
						/*
						 * initialize : function(options) { },
						 */
						createDlgContent : function() {
							this.gridId = "dg" + this.dlgId;

							return '<div id="' + this.gridId
									+ '" class="propertyGridPanel"></div>';
						},
						show : function() {
							$("body").append(this.$dlg);
							var $dlg = $(this.$dlg);
							var _self = this;
							$dlg.window({
										modal : true,
										title : this.get("title"),
										width : this.get("width"),
										height : this.get("height")
									});
							var gridObj = $('#' + _self.gridId, $dlg);
							this.gridObj = gridObj;
							gridObj.propertygrid({
										fit : true,
										showGroup : true,
										scrollbarSize : 0,
										columns : [[{
													field : 'name',
													title : '属性',
													width : 100,
													sortable : true
												}, {
													field : 'value',
													title : '值',
													width : 100,
													resizable : false
												}]]
									});
							var propertyData = this.get("propertyData");
							$('#' + _self.gridId, $dlg).propertygrid(
									'loadData', {
										rows : propertyData
									});

							$('#gridLayout' + this.dlgId, $dlg).layout();
							$('#gridCfgBtn' + this.dlgId, $dlg).button({
								onClick : function() {
									var allRows = $('#' + _self.gridId, $dlg)
											.propertygrid("getRows");
									var data = {};
									for (var i = 0; i < allRows.length; i++) {
										$('#' + _self.gridId, $dlg)
												.propertygrid('endEdit', i)
									}
									var rows = $('#' + _self.gridId, $dlg)
											.propertygrid('getChanges');
									for (var i = 0; i < rows.length; i++) {

										data[rows[i].id] = rows[i].value
									};
									_self.trigger("close", data);
									$dlg.window('close');
									$dlg.window('destroy');
									/*
									 * endEditing(); var rows =
									 * $('#'+_self.gridId, $dlg)
									 * .treegrid("getData");
									 * 
									 * control.setControlAttr(dataKey, rows);
									 * 
									 * $dlg.window('close');
									 * $dlg.window('destroy');
									 */

								}
							});
							$('#gridCanelBtn' + this.dlgId, $dlg).button({
										onClick : function() {
											$dlg.window('close');
											$dlg.window('destroy');
											/*
											 * var control =
											 * _self.getBindControl(); // var
											 * rows = $('#'+_self.gridId,
											 * $dlg).datagrid("getRows");
											 * 
											 * control.setControlAttr(dataKey,
											 * control .get(dataKey));
											 * $dlg.window('close');
											 * $dlg.window('destroy');
											 */
										}
									});
						}
					});

			var getGridColunm = function(scope, parentDlg,key) {

				var columns = getControlAttrs(key, scope, parentDlg);
				var delAttrs = [];
				for (var i = 0; i < columns.length; i++) {
					columns[i]["field"] = columns[i]["id"];
					if (scope.type == "combogrid") {
						if (columns[i].field == "editorType"
								|| columns[i].field == "editOptions"
								|| columns[i].field == "buttons") {
							delAttrs.push(i);
						}
					}
					
					
					delete columns[i].id;
				}
				for (var i = 0; i < delAttrs.length; i++) {
					columns.splice(delAttrs[i], 1);
				}
				return columns;
				/*
				 * var attrsObj = attrDefineConfig["Column"]; var colunms = [];
				 * for (var key in attrsObj) { colunms.push($.extend(true, {}, {
				 * field : key }, attrsObj[key])); } return colunms;
				 */

			};
			var getControlAttrs = function(type, scope, params) {
				var attrsObj = attrDefineConfig[type];
				var controlAttrs = [];
				if (attrsObj) {
					var newAttrObj = mergeAttrs(attrsObj);
					var allAttrs = newAttrObj.attrs;
					for (var key in allAttrs) {
						var attrCfg = $.extend(true, {}, allAttrs[key], {
									id : key,
									// scope : params.scope,
									value : attrsObj.attrDefaultValue
											? attrsObj.attrDefaultValue[key]
											: null
								});
						if (newAttrObj.attrEvents && newAttrObj.attrEvents[key]) {

							if (attrCfg["editor"]
									&& typeof attrCfg["editor"] == "object") {
								var arrtEvent = newAttrObj.attrEvents[key];
								var opt = {};
								for (var eventName in arrtEvent) {
									opt[eventName] = function(event) {
										var event = event;
										var eventFun = function() {
											event.apply(scope, [params]);
										}

										return eventFun;
									}(arrtEvent[eventName]);
								};
								// todo combogrid colunms
								attrCfg["editor"]["options"] = $.extend(true,
										{}, attrCfg["editor"]["options"], opt);

							}

						}
						controlAttrs.push(attrCfg);
					}
				}
				return controlAttrs;
			};
			/**
			 * 合并属性列表
			 */
			var mergeAttrs = function(attrsObj) {
				var newAttrsObj = {};
				if (attrsObj.superClass) {
					var superClass = attrDefineConfig[attrsObj.superClass];
					var superAttrsObj = mergeAttrs(superClass);
					// newAttrsObj = $.extend(true, {},attrsObj);
					newAttrsObj.attrEvents = $.extend(true, {},
							superAttrsObj.attrEvents, attrsObj.attrEvents);
					newAttrsObj.attrs = $.extend(true, {}, superAttrsObj.attrs,
							attrsObj.attrs);
					if (superClass.privateAttrs) {
						var privateAttrs = superClass.privateAttrs;
						for (var i = 0; i < privateAttrs.length; i++) {
							delete newAttrsObj.attrs[privateAttrs[i]];
						}
					}
					newAttrsObj.attrDefaultValue = $.extend(true, {},
							superAttrsObj.attrDefaultValue,
							attrsObj.attrDefaultValue);
					// newAttrsObj.privateAttrs=attrsObj["privateAttrs"]
					return newAttrsObj;
				} else {
					return attrsObj;
				}
			};
			return {
				getClassAttrs : function(type) {
					var attrsObj = attrDefineConfig[type];

					/*
					 * console.log(type+"bengin"); var str='<Component
					 * extClass="'+type+'" extends="'+attrsObj.superClass+'"
					 * xtype="'+type+'">\r\n'; str=str+'<Properties>\r\n'; var
					 * attrs=attrsObj.attrs; for(var key in attrs){ var
					 * attr=attrs[key]; if (attr){ str=str+'<Property
					 * name="'+key+'" type="'+(attr.dataType||"String")+'"
					 * comment="'+attr.name+'" />\r\n'; } } str=str+'</Properties>\r\n' ;
					 * str=str+'</Component>\r\n'; console.log(str);
					 * console.log(type+"end");
					 */
					var classAttrs = {};
					if (attrsObj) {
						var newAttrObj = mergeAttrs(attrsObj);
						var allAttrs = newAttrObj.attrs;
						for (var key in allAttrs) {

							try {
								if (allAttrs[key].value == undefined
										|| allAttrs[key].value === "") {
									classAttrs[key] = "";
								} else {

									classAttrs[key] = allAttrs[key].value;
								}
								if (newAttrObj.attrDefaultValue
										&& newAttrObj.attrDefaultValue[key] != undefined) {
									classAttrs[key] = newAttrObj.attrDefaultValue[key];
								}
							} catch (ex) {
								console.log(key)
							}
							// attrs.controlPropertys.push($.extends(allAttrs[key],{id:key}));
						}

					}

					return classAttrs;
				},
				getControlAttrs : getControlAttrs,
				getAttrDefineConfig : function() {
					return attrDefineConfig
				},
				getColnumEditorAttConfig : function() {
					return colnumEditorAttConfig;
				}
			};
		});