/**
 * 系统选项设置
 */
define(["app/core/app-core",localeFile],function(App,AppLang){
	App.options={
		/**
		 * app控件的默认值
		 */
		appDefaults:{
			xquery:{
				className: 'xquery'
			},
			XqueryBox:{
				className: 'app-xquerybox'
			},
			Textbox: {
				/**
				 * 隐藏值
				 * @memberof textbox-class
				 * @property {String} [value] 值
				 */
				value: '',
				/**
				 * 显示值
				 * @memberof textbox-class
				 * @property {String} [text] 显示值
				 */
				text: '',
				/**
				 * 可输入的最长字符数
				 * @memberof textbox-class
				 * @property {Number} [maxLength] 字符数
				 */
				maxLength: null,
				/**
				 * 只读状态
				 * @memberof textbox-class
				 * @property {Boolean} [readonly=false] 只读状态
				 */
				readonly: false,
				/**
				 * 禁用状态
				 * @memberof textbox-class
				 * @property {Boolean} [disabled=false] 禁用状态
				 */
				disabled: false,
				/**
				 * 控件的宽度
				 * @property {Number|String} [width] 宽度
				 * @todo 默认由css控制
				 * @todo 可以指定具体像素宽度[px] eg.150px
				 * @todo 也可以指定百分比宽度[%]，百分比宽度为相对于父级元素的宽度 eg.100%
				 * @memberof textbox-class
				 */
				width: '',
				/**
				 * 显示值文本框的css样式
				 * @memberof textbox-class
				 * @property {Style} [style] 显示值文本框的css样式
				 * @example &lt;input &#9;class="app-textbox"
				 * &#9;style="color:red;text-align:center;"
				 * &#9;_options="{value:'德国 Germany'}"
				 * />
				 */
				style: '',
				/**
				 * 包装器的css样式
				 * @memberof textbox-class
				 * @property {Style} [wrapstyle] 包装器的css样式
				 * @example &lt;input &#9;class="app-textbox"
				 * &#9;wrapstyle="height:60px;"
				 * />
				 */
				wrapstyle: '',
				/**
				 * 显示值是否为多行文本框
				 * @memberof textbox-class
				 * @property {Boolean} [multiline=false] 多行
				 * @example &lt;input &#9;class="app-textbox"
				 * &#9;wrapstyle="height:60px;"
				 * &#9;multiline="true"
				 * />
				 */
				multiline: false,
				/**
				 * 是否显示清除按钮
				 * <PRE>多选状态 默认为true</PRE>
				 * @memberof textbox-class
				 * @property {Boolean} [clearbtn=false] 显示清除按钮
				 */
				clearbtn: false,
				/**
				 * 辅助提示信息
				 * @memberof textbox-class
				 * @property {String} [tips] 辅助提示信息
				 */
				tips: '',
				/**
				 * <span class="type-signature static">使用时 需考虑输入法影响键码</span>
				 * 定义如何筛选按下的键，如果为自定义事件 返回false阻止输入
				 * <PRE>内置过滤类型
				 * positiveNumber: 只允许输入 0-9，小数点
				 * number: 只允许输入 0-9，小数点，正负号
				 * 0-9：只允许输入 0-9
				 * all：任意输入
				 * </PRE>
				 * @memberof textbox-class
				 * @property {String|Function} [filter] 键盘输入的过滤器
				 */
				filter: null,
				/**
				 * <span class="type-signature static">该属性与filter属性只能设置一个，当设置forbidWord时，filter失效</span>
				 * 禁止输入的字符
				 * @memberof textbox-class
				 * @property {String} [forbidWord] 禁止输入的字符
				 */
				forbidWord: null,
				/**
				 * <span class="type-signature static">该属性与filter属性只能设置一个，当设置permitWord时，filter失效</span>
				 * 允许输入的字符
				 * @memberof textbox-class
				 * @property {String} [permitWord] 允许输入的字符
				 */
				permitWord: null,
				/**
				 * 是否去除前后空格
				 * @memberof textbox-class
				 * @property {Boolean} [trim=true] 去除
				 */
				trim: true,
				className: 'app-textbox'
			},
			Combo: {
				/**
				 * 数据对象中作为隐藏值的属性名
				 * @memberof combo-class
				 * @property {String} [valuefield=id] 隐藏值属性名
				 */
				valuefield: 'id',
				/**
				 * 数据对象中作为显示值的属性名
				 * @memberof combo-class
				 * @property {String} [textfield=name] 显示值属性名
				 */
				textfield: 'name',
				/**
				 * 查询参数
				 * <PRE>
				 * 	如果值为Function,如果要想置空查询条件，则必须返回{}对象
				 * </PRE>
				 * @memberof combo-class
				 * @property {Json|Function} [parameter] 查询参数
				 * @example &lt;input &#9;class="app-combobox"
				 * &#9;_options="{
				 * &#9;&#9;parameter: {param:'paramVal'},
				 * &#9;&#9;valuefield: 'value',
				 * &#9;&#9;textfield: 'text'
				 * &#9;&#9;action: 'html/example/app-input/data/data.valueAndText'
				 * &#9;}"
				 * />
				 */
				parameter: null,
				/**
				 * 自动隐藏打开按钮
				 * @memberof combo-class
				 * @property {Boolean} [autoHideOpenBtn=false] 不自动隐藏
				 */
				autoHideOpenBtn: false,
				/**
				 * 是否自动隐藏下拉面板
				 * @memberof combo-class
				 * @property {Boolean} [fadeout=false] 不自动
				 */
				fadeout: false,
				/**
				 * 下拉面板的宽度
				 * @todo 宽度默认为空，继承至input组件的宽度
				 * @todo 可以指定具体像素宽度[px] eg.250
				 * @todo 也可以指定百分比宽度[%]，百分比宽度为相对于面板所属的组件宽度 eg. 150%
				 * @memberof combo-class
				 * @property {Number|String} [panelwidth] 下拉面板的宽度
				 */
				panelwidth: '',
				/**
				 * 面板高度
				 * @memberof combo-class
				 * @property {Number} [panelheight=265] 下拉面板的高度
				 */
				panelheight: 265,
				/**
				 * 自定义面板高度
				 * @memberof combo-class
				 * @property {Number} [customPanelHeight=0] 高度
				 */
				customPanelHeight: 0,
				/**
				 * 自定义面板在主面板的相对位置
				 * top 上边
				 * bottom 下边
				 * @memberof combo-class
				 * @property {String} [customPanelPosition=bottom]
				 */
				customPanelPosition: 'bottom',
				/**
				 * <span class="type-signature static">override</span>
				 * 是否拥有一个打开按钮
				 * @memberof combo-class
				 * @property {Boolean} [openbtn=true] 拥有打开按钮
				 */
				openbtn: true,
				/**
				 * 格式化配置
				 * <PRE>
				 * 函数类型：eg.function(node){ return node.code + '-' + node.name ;}
				 * 通过setSelectedNode方法设置时，调用该函数进行格式化
				 * 该函数接收选中节点作为参数，返回一个字符串作为显示值
				 * 字符串类型：eg. code
				 * 指定一个实体的属性
				 * 表达式类型：eg.{code}-{name}
				 * 使用{}包裹字段并使用实体进行替换
				 * </PRE>
				 * @memberof combo-class
				 * @property {Function|String} [formatter=null] 格式化配置
				 */
				formatter: null,
				/**
				 * 打开下拉面板
				 * @memberof combo-class
				 * @property {Array} keyShowPanel=[{keyCode:App.keyCode.DOWN, ctrlKey:true}
				 * 				,{keyCode:App.keyCode.UP, ctrlKey:true}] 按键值数组
				 */
				keyShowPanel: [{keyCode:App.keyCode.DOWN, ctrlKey:true}
								,{keyCode:App.keyCode.UP, ctrlKey:true}],
				/**
				 * 打开下拉面板
				 * @memberof combo-class
				 * @property {Array} keyHidePanel=[App.keyCode.ESC,App.keyCode.TAB] 按键值数组
				 */
				keyHidePanel: [App.keyCode.ESC, App.keyCode.TAB],
				/**
				 * 定位下一个节点
				 * @memberof combo-class
				 * @property {Array} keyNextNode=[App.keyCode.DOWN] 按键值数组
				 */
				keyNextNode: [App.keyCode.DOWN],
				/**
				 * 定位上一个节点
				 * @memberof combo-class
				 * @property {Array} keyPrevNode=[App.keyCode.UP] 按键值数组
				 */
				keyPrevNode: [App.keyCode.UP],
				/**
				 * 选中当前节点
				 * @memberof combo-class
				 * @property {Array} keyPrevNode=[App.keyCode.ENTER] 按键值数组
				 */
				keyPickNode: [App.keyCode.ENTER],
				className: 'app-combo'
			},
			Combobox: {
				/**
				 * 要加载数据的url，也可以通过action设置
				 * @memberof combobox-class
				 * @property {Url} [url] url数据源
				 */
				url: '',
				/**
				 * 是否允许多选
				 * @memberof combobox-class
				 * @property {Boolean} [multiple=false] 多选
				 * />
				 */
				multiple: false,
				/**
				 * 本地数据源，
				 * 当配置该属性时，优先使用该数据源 并忽略action
				 * @memberof combobox-class
				 * @property {Json} [data] 本地数据源
				 */
				data: null,
				/**
				 * <span class="type-signature static">override</span>
				 * 下拉面板高度
				 * @memberof combobox-class
				 * @property {Number} [panelheight=242] 下拉面板的高度
				 */
				panelheight: 242,
				/**
				 * 定位下一个节点
				 * @memberof combobox-class
				 * @property {Array} keyNextNode=[App.keyCode.DOWN,App.keyCode.RIGHT] 按键值数组
				 */
				keyNextNode: [App.keyCode.DOWN,App.keyCode.RIGHT],
				/**
				 * 定位上一个节点
				 * @memberof combobox-class
				 * @property {Array} keyPrevNode=[App.keyCode.UP,App.keyCode.LEFT] 按键值数组
				 */
				keyPrevNode: [App.keyCode.UP,App.keyCode.LEFT],
				/**
				 * 允许联想
				 * @memberof combobox-class
				 * @property {Boolean} [usesuggest=false] 允许联想
				 */
				usesuggest: false,
				/**
				 * 是否允许删除节点
				 * @memberof combobox-class
				 * @property {Boolean} [nodeDelete=false] 不允许
				 */
				nodeDelete: false,
				/**
				 * 是否允许按键可清除值
				 * @memberof combobox-class
				 * @property {Boolean} [clearable=true] 允许
				 */
				clearable: true,
				className: 'app-combobox'
			},
			Comboztree: {
				/**
				 * 要加载数据的url，也可以通过action设置
				 * @memberof comboztree-class
				 * @property {Url} [url] url数据源
				 */
				url: '',
				/**
				 * 异步加载子节点的url地址 当[async = true 时生效]
				 * @memberof comboztree-class
				 * @property {Url} [asyncUrl] asyncUrl
				 */
				asyncUrl: '',
				/**
				 * 只能选择叶子节点
				 * @memberof comboztree-class
				 * @property {Boolean} [onlyleaf=false] 只能选择叶子节点
				 */
				onlyleaf: false,
				/**
				 * 是否独自选择节点 当multiple为true时 有效
				 * @todo 勾选父节点时勾选子节点
				 * @todo 取消勾选父节点时取消勾选子节点
				 * @todo 子节点全部勾选时是勾选父节点
				 * @todo 子节点全部取消勾选时是取消勾选父节点
				 * @memberof comboztree-class
				 * @property {Boolean} [checkBySelf=false] 关联选择
				 */
				checkBySelf: false,
				/**
				 * 远程数据，次级节点异步加载设置
				 * @memberof comboztree-class
				 * @property {Boolean} [async=true] 是否异步加载节点
				 */
				async: true,
				/**
				 * 设置 树 是否显示节点的图标
				 * @memberof comboztree-class
				 * @property {Boolean} [showIcon=false] true / false 分别表示 显示 / 隐藏 图标
				 */
				showIcon: false,
				/**
				 * 是否允许多选
				 * @memberof comboztree-class
				 * @property {Boolean} [multiple=false] 多选
				 */
				multiple: false,
				/**
				 * 节点唯一标识的属性名称
				 * 默认和valuefield相同
				 * @memberof comboztree-class
				 * @property {String} [idfield=null] 节点唯一标识的属性名称
				 */
				idfield: null,
				/**
				 * 节点数据中保存其父节点唯一标识的属性名称
				 * @memberof comboztree-class
				 * @property {String} [pidfield=pId] 父节点唯一标识的属性名称
				 */
				pidfield: 'pId',
				/**
				 * 用于修正根节点父节点数据，即 pIdKey 指定的属性值
				 * @memberof comboztree-class
				 * @property {String} [rootpidvalue=''] 根节点属性值
				 */
				rootpidvalue: '',
				/**
				 * 异步加载时需要自动提交父节点属性的参数
				 * @todo 将需要作为参数提交的属性名称，制作成 Array 即可，例如：["id", "name"]
				 * @todo 可以设置提交时的参数名称，例如 server 只接受 zId : ["id=zId"]
				 * @memberof comboztree-class
				 * @property {String} [rootpidvalue=''] 根节点属性值
				 * @example <PRE>&lt;input &#9;class="app-comboztree"
				 * &#9;_options="{
				 * &#9;&#9;action: 'platform/sample/base/ui/treeJson.do',
				 * &#9;&#9;autoparam: 'id,name'
				 * &#9;}"
				 * /></PRE>  假设 异步加载 父节点(node = {id:1, name:"test"}) 的子节点时，将提交参数 id=1&name=test
				 * @example <PRE>&lt;input &#9;class="app-comboztree"
				 * &#9;_options="{
				 * &#9;&#9;action: 'platform/sample/base/ui/treeJson.do',
				 * &#9;&#9;autoparam: 'id=zId,name'
				 * &#9;}"
				 * /></PRE>  假设 异步加载 父节点(node = {id:1, name:"test"}) 的子节点时，将提交参数 zId=1&name=test
				 */
				autoparam: null,
				/**
				 * 异步加载时子节点时，要提交的静态参数
				 * @memberof comboztree-class
				 * @example <PRE>&lt;input &#9;class="app-comboztree"
				 * &#9;_options="{
				 * &#9;&#9;action: 'platform/sample/base/ui/treeJson.do',
				 * &#9;&#9;otherParam: {dataSet: 'bank'}
				 * &#9;}"
				 * /></PRE>
				 */
				otherParam: null,
				/**
				 * 允许联想
				 * @memberof comboztree-class
				 * @property {Boolean} [usesuggest=false] 允许联想
				 */
				usesuggest: false,
				/**
				 * <span class="type-signature static">override</span>
				 * 下拉面板的高度
				 * @memberof comboztree-class
				 * @property {Number} [panelheight=232] 下拉面板的高度
				 */
				panelheight: 232,
				/**
				 * 对值进行优化，该参数只针对multiple = true 时，有效
				 * @todo 忽略半勾选节点
				 * @todo 并当父节点被全选时，子节点不作为值
				 * @memberof comboztree-class
				 * @property {Boolean} [shrinkValue=true] 默认进行优化值
				 */
				shrinkValue: true,
				/**
				 * 忽略半勾选节点
				 * @memberof comboztree-class
				 * @property {Boolean} [ignoreHalfCheck=true] 默认忽略
				 */
				ignoreHalfCheck: true,
				/**
				 * 进行本地高亮匹配检索时的延迟检索时间(ms)
				 * @memberof comboztree-class
				 * @property {Number} [lazy=300] 延迟检索时间(毫秒)
				 */
				lazy: 300,
				/**
				 * 定位到子节点
				 * @memberof comboztree-class
				 * @property {Array} keyChildNode=[App.keyCode.RIGHT] 按键值数组
				 */
				keyChildNode: [App.keyCode.RIGHT],
				/**
				 * 定位到父节点
				 * @memberof comboztree-class
				 * @property {Array} keyParentNode=[App.keyCode.LEFT] 按键值数组
				 */
				keyParentNode: [App.keyCode.LEFT],
				className: 'app-comboztree'
			},
			Reference: {
				/**
				 * 数据对象中作为隐藏值的属性名
				 * @memberof reference-class
				 * @property {String} [valuefield=id] 隐藏值属性名
				 */
				valuefield: 'id',
				/**
				 * 数据对象中作为显示值的属性名
				 * @memberof reference-class
				 * @property {String} [textfield=name] 显示值属性名
				 */
				textfield: 'name',
				/**
				 * 弹出对话框的标题
				 * @memberof reference-class
				 * @property {Boolean} [title=对话框] 标题
				 */
				title: '对话框',
				/**
				 * 显示标题栏
				 * @memberof reference-class
				 * @property {Boolean} [hasheader=true] 显示标题栏
				 */
				hasheader: true,
				/**
				 * 对话框的宽度，null则会自适应
				 * @memberof reference-class
				 * @property {Number} [digWidth=null] 宽度
				 */
				digWidth: null,
				/**
				 * 对话框的高度，null则会自适应
				 * @memberof reference-class
				 * @property {Number} [digHeight=null] 高度
				 */
				digHeight: null,
				/**
				 * <span class="type-signature static">override</span>
				 * 是否拥有一个清除按钮
				 * @memberof reference-class
				 * @property {Boolean} [clearbtn=true] 拥有清除按钮
				 */
				clearbtn: true,
				/**
				 * <span class="type-signature static">override</span>
				 * 是否拥有一个打开按钮
				 * @memberof reference-class
				 * @property {Boolean} [openbtn=true] 拥有打开按钮
				 */
				openbtn: true,
				/**
				 * 对话框的url
				 * @memberof reference-class
				 * @property {URL} [url=null] 对话框的url
				 */
				url: null,
				className: 'app-reference'
			},
			Suggest: {
				/**
				 * <span class="type-signature static">override</span>
				 * 面板高度 该面板为固定高度
				 * @memberof suggest-class
				 * @property {Number} [panelheight=242] 下拉面板的高度
				 */
				panelheight: 242,
				/**
				 * 联想面板内 已选结果面板的高度
				 * @memberof suggest-class
				 * @property {Number} [slt_area=30] 已选框的高度
				 */
				slt_area: 30,
				/**
				 * 联想地址，该属性优先于action
				 * @memberof suggest-class
				 * @property {String} [suggest] 联想地址
				 */
				suggest: '',
				/**
				 * 联想过滤时使用的匹配属性，多个属性使用,分隔
				 * <PRE>
				 * 当没有配置该属性时，默认使用textfield
				 * 远程联想时 可以通过_key接收输入的搜索关键字、suggestfield接收该字段的配置
				 * </PRE>
				 * @memberof suggest-class
				 * @property {String} [suggestfield] 匹配属性
				 */
				suggestfield: '',
				/**
				 * 是否远程加载，该属性优先于async
				 * false：第一次根据suggest进行远程加载作为数据源，此后根据本地数据源进行联想匹配
				 * true: 如果为true，则每次根据suggest去后台匹配数据
				 * @memberof suggest-class
				 * @property {Boolean} [remote=false] 每次远程联想
				 */
				remote: false,
				/**
				 * 进行联想的延迟检索时间(ms)
				 * @memberof suggest-class
				 * @property {Number} [lazy=500] 远程搜索时间（毫秒）
				 */
				lazy: 500,
				/**
				 * 是否允许多选
				 * @memberof suggest-class
				 * @property {Boolean} [multiple=false] 多选
				 */
				multiple:false,
				/**
				 * 接受输入的内容作为值
				 * @memberof suggest-class
				 * @property {Boolean} [acceptText=false] 不接受
				 */
				acceptText: false,
				/**
				 * 联想清值，该属性设置只在单选模式生效
				 * @memberof suggest-class
				 * @property {Boolean} [suggestClear=false] 联想时是否清值
				 */
				suggestClear: false,
				/**
				 * 切换到已选区域，定位下一个已选择节点
				 * @memberof suggest-class
				 * @property {Array} keyNextSltNode=[App.keyCode.RIGHT] 按键值数组
				 */
				keyNextSltNode: [App.keyCode.RIGHT],
				/**
				 * 切换到已选区域，定位上一个已选择节点
				 * @memberof suggest-class
				 * @property {Array} keyPrevSltNode=[App.keyCode.LEFT] 按键值数组
				 */
				keyPrevSltNode: [App.keyCode.LEFT],
				className: 'app-suggest'
			},
			Typeahead: {
				/**
				 * 联想地址
				 * @memberof typeahead-class
				 * @property {String} [suggest] 联想地址
				 */
				suggest: '',
				/**
				 * 是否远程加载
				 * false：第一次根据suggest进行远程加载作为数据源，此后根据本地数据源进行联想匹配
				 * true: 如果为true，则每次根据suggest去后台匹配数据
				 * @memberof typeahead-class
				 * @property {Boolean} [remote=false] 每次远程联想
				 */
				remote: false,
				/**
				 * 进行联想的延迟检索时间(ms)
				 * @memberof typeahead-class
				 * @property {Number} [lazy=500] 远程搜索时间（毫秒）
				 */
				lazy: 500,
				/**
				 * 定位下一个节点
				 * @memberof typeahead-class-class
				 * @property {Array} keyNextNode=[App.keyCode.DOWN,App.keyCode.RIGHT] 按键值数组
				 */
				keyNextNode: [App.keyCode.DOWN,App.keyCode.RIGHT],
				/**
				 * 定位上一个节点
				 * @memberof typeahead-class-class
				 * @property {Array} keyPrevNode=[App.keyCode.UP,App.keyCode.LEFT] 按键值数组
				 */
				keyPrevNode: [App.keyCode.UP,App.keyCode.LEFT],
				className: 'app-typeahead'
			},
			Money: {
				/**
				 * 数值的小数位
				 * @memberof money-class
				 * @property {Number} [precision=2] 保留2位小数
				 */
				precision: 2,
				/**
				 * 格式化函数
				 * <PRE>
				 * 该函数接收当前输入的值，并返回一个字符串作为显示值
				 * 内置格式化方法
				 * 大写金额：chinese
				 * 千分位金额：thousand
				 * </PRE>
				 * @memberof money-class
				 * @property {String|Function} [formatter] 格式化函数
				 */
				formatter: 'thousand',
				/**
				 * <span class="type-signature static">override</span>
				 * 定义如何筛选按下的键，返回true接受输入
				 * <PRE>内置过滤类型
				 * positiveNumber: 只允许输入 0-9，小数点
				 * number: 只允许输入 0-9，小数点，正负号
				 * 0-9：只允许输入 0-9
				 * all：任意输入
				 * </PRE>
				 * @memberof money-class
				 * @property {String|Function} [filter='number'] 键盘输入的过滤器
				 */
				filter: 'number',
				/**
				 * 前缀(只针对千分法)
				 * @memberof money-class
				 * @property {String} [prefix=¥] 前缀
				 */
				prefix: '¥',
				className: 'app-money'
			},
			Number: {
				/**
				 * 最小值  组件允许接受的最小值
				 * @memberof number-class
				 * @property {Number} [min=null] 最小值
				 */
				min: null,
				/**
				 * 最大值  组件允许接受的最大值
				 * @memberof number-class
				 * @property {Number} [max=null] 最大值
				 */
				max: null,
				/**
				 * 不定长精度
				 * <PRE>
				 * 	false：为定长的进度，即精度为几位，则保留几位小数
				 * 	true：为不定长的进度，即输入的进度为几位，则最大保留到几位，此时precision代表最大精度
				 * </PRE>
				 * @memberof number-class
				 * @property {Number} [varlen=false] 变长精度
				 */
				varlen: false,
				/**
				 * 精度
				 * @memberof number-class
				 * @property {Number} [precision=0] 保留0位小数
				 */
				precision: 0,
				/**
				 * 前缀
				 * @memberof number-class
				 * @property {String} [prefix=''] 前缀
				 */
				prefix: '',
				/**
				 * 后缀
				 * @memberof number-class
				 * @property {String} [suffix=''] 后缀
				 */
				suffix: '',
				/**
				 * <span class="type-signature static">override</span>
				 * 定义如何筛选按下的键，返回true接受输入
				 * <PRE>内置过滤类型
				 * number: 只允许输入 0-9，小数点，正负号
				 * 0-9：只允许输入 0-9
				 * all：任意输入
				 * </PRE>
				 * @memberof number-class
				 * @property {String|Function} [filter='number'] 键盘输入的过滤器
				 */
				filter: 'number',
				/**
				 * 定义格式化输出显示值。返回的字符串值，会显示在输入框中
				 * <PRE>内置格式化方法
				 * 大写金额：chinese
				 * 千分位金额：thousand
				 * </PRE>
				 * @memberof number-class
				 * @property {String|Function} [formatter] 格式化函数
				 */
				formatter: null,
				/**
				 * 当值为0时 显示为空
				 * @memberof number-class
				 * @property {String|Function} [zeroIsNull=false] 0显示为0
				 */
				zeroIsNull: false,
				className: 'app-number'
			},
			DateTime: {
				/**
				 * <span class="type-signature static">override</span>
				 * 是否拥有一个打开按钮
				 * @memberof datetime-class
				 * @property {Boolean} [openbtn=true] 拥有打开按钮
				 */
				openbtn: true,
				/**
				 * 是否只能选择
				 * @memberof datetime-class
				 * @property {Boolean} [onlySelect=false] 可以选择和输入
				 */
				onlySelect: false,
				/**
				 * 日期时间框类型
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
				 * @memberof datetime-class
				 * @property {String} [type=date] 类型
				 */
				type: 'date',
				/**
				 * 显示值的日期时间格式化串
				 * <PRE>
				 * p, P, h, hh, i, ii, s, ss, d, dd, m, mm, M, MM, yy, yyyy 的任意组合。
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
				 * @memberof datetime-class
				 * @property {String} [format=yyyy-mm-dd] 格式化串
				 */
				format: 'yyyy-mm-dd',
				/**
				 * 隐藏值的日期时间格式化串，具体方式参照显示值格式化
				 * @memberof datetime-class
				 * @property {String} [valueFormat] 格式化串
				 */
				valueFormat: null,
				/**
				 * 语言
				 * @memberof datetime-class
				 * @property {String} [language=zh_CN] 语言
				 */
				language: AppLang.locale,
				/**
				 * 一周从哪一天开始。0（星期日）到6（星期六）
				 * @memberof datetime-class
				 * @property {String} [weekStart=1] 一周从哪一天开始
				 */
				weekStart: 1,
				/**
				 * 当选择一个日期之后是否立即关闭此日期时间选择器
				 * @memberof datetime-class
				 * @property {Boolean} [autoclose=true] 自动关闭
				 */
				autoclose: true,
				/**
				 * 是否显示今天按钮
				 * <PRE>
				 * 如果此值为true 或 "linked"，
				 * 		则在日期时间选择器组件的底部显示一个 "Today" 按钮用以选择当前日期。
				 * 如果是true的话，"Today" 按钮仅仅将视图转到当天的日期.
				 * 如果是"linked"，当天日期将会被选中
				 * </PRE>
				 * @memberof datetime-class
				 * @property {Boolean} [todayBtn=true] 显示今天按钮
				 */
				todayBtn: true,
				/**
				 * 高亮当前日期
				 * @memberof datetime-class
				 * @property {Boolean} [todayHighlight=true] 高亮当前日期
				 */
				todayHighlight: true,
				/**
				 * 日期时间选择器打开之后首先显示的视图。
				 * <PRE>可接受的值
				 * 0 小时视图
				 * 1 日期视图
				 * 2 月视图
				 * 3 年视图
				 * 4 十年视图
				 * </PRE>
				 * @memberof datetime-class
				 * @property {Number} [startView=2] 起始视图
				 */
				startView: 2,
				/**
				 * 日期时间选择器所能够提供的最精确的时间选择视图。
				 * <PRE>
				 * 可接受的值
				 * 0 小时视图
				 * 1 日期视图
				 * 2 月视图
				 * 3 年视图
				 * 4 十年视图
				 * </PRE>
				 * @memberof datetime-class
				 * @property {Number} [minView=2] 结束视图
				 */
				minView: 2,
				className: 'app-datetime'
			},
			Grid: {
				/**
				 * 要加载数据的url，也可以通过action设置
				 * @memberof grid-class
				 * @property {Url} [url] url数据源
				 */
				url: '',
				/**
				 * 网格的标题
				 * @memberof grid-class
				 * @property {String|Number} [title] 网格标题
				 */
				title: '',
				/**
				 * 标题行高
				 * @memberof grid-class
				 * @property {Number} [headRowHeight] 标题行高
				 */
				headRowHeight: 28,
				/**
				 * 斑马条纹
				 * @memberof grid-class
				 * @property {Boolean} [striped=true] 斑马条纹
				 */
				striped: true,
				/**
				 * 工具条最大高度(px)
				 * @memberof grid-class
				 * @property {Number} [toolbarHeight=33] 工具条最大高度
				 */
				toolbarHeight: 33,
				/**
				 * 工具条
				 * @memberof grid-class
				 * @property {Array} [toolbar] 工具条
				 * @property {String} [toolbar.text] 按钮标题
				 * @property {String} [toolbar.iconCls] 按钮样式
				 * @property {Function} [toolbar.handler] 按钮操作
				 */
				toolbar: null,
				/**
				 * 表格主键
				 * @memberof grid-class
				 * @property {String} [idField=id] 表格主键
				 */
				idField: 'id',
				/**
				 * 是否生成隐藏列的内容数据
				 * @todo 不生成内容数据的表格不能使用将初始为隐藏列设置为显示功能
				 * @memberof grid-class
				 * @property {Boolean} [hiddenColumnInit=false] 不生成
				 */
				hiddenColumnInit: false,
				/**
				 * 网格的宽度
				 * <PRE>宽度默认为空：撑满整个父容器</PRE>
				 * @memberof grid-class
				 * @property {Number} [width] 宽度
				 */
				width: null,
				/**
				 * 网格的高度
				 * <PRE>
				 * 1、高度默认为空：撑满整个父容器
				 * 2、当值为push时，高度随着数据的变化而变化
				 * </PRE>
				 * @memberof grid-class
				 * @property {Number|String} [height] 高度
				 */
				height: null,
				/**
				 * 跟随滚动
				 * <PRE>默认all
				 * 可选值
				 * none 不跟随
				 * header 网格头
				 * footer 网格尾
				 * all 网格头和网格尾
				 * </PRE>
				 * @memberof grid-class
				 * @property {String} [follow=all] 表头/尾跟随
				 */
				follow: 'all',
				/**
				 * 是否列标题栏的对齐方式跟随
				 * @todo 当结果为false时，标题头居中
				 * @todo 当结果为true时，标题头与列的对齐方式相同
				 * @memberof grid-class
				 * @property {Boolean} [halign=false] 列标题栏的对齐方式跟随
				 */
				halign: false,
				/**
				 * 是否显示复选框
				 * @memberof grid-class
				 * @property {Boolean} [checkbox=false] 是否显示复选框
				 */
		        checkbox: false,
		        /**
				 * 是否显示单选框
				 * @memberof grid-class
				 * @property {Boolean} [radiobox=false] 是否显示单选框
				 */
		        radiobox: false,
		        /**
				 * 是否允许多列排序
				 * @memberof grid-class
				 * @property {Boolean} [multiSort=false] 多列排序
				 */
		        multiSort: false,
		        /**
				 * 是否远程排序
				 * @memberof grid-class
				 * @property {Boolean} [remoteSort=false] 远程排序
				 */
		        remoteSort: false,
		        /**
				 * 行号
				 * <PRE>
				 * 默认none
				 * 可选值
				 * none: 不显示
				 * normal: 普通
				 * repeat: 重复
				 * </PRE>
				 * @memberof grid-class
				 * @property {String} [rownumbers='none'] 行号
				 */

		        rownumbers: 'none',
		        /**
				 * 视图扩展
				 * <PRE>
				 * view:{type:'CardView'卡片类型,region:'right'//卡片位置,formEl:'表单id',cardWidth:'卡片宽',rowRender:'渲染回调'}
				 * </PRE>
				 * @memberof view
				 * @property{Object} [view=null]
				 */
				view:{type:'GridView',region:'right',isDefault:false},
				/**
				 * 是否开启切换视图
				 * <PRE>
				 * 默认false
				 * </PRE>
				 * @memberof grid-class
				 * @property {boolean}
				 */
				switchView:false,
		        /**
		         * 是否显示合计行序号
		         * @memberof grid-class
				 * @property {String} [footerRowNumber=false]
		         */
		        footerRowNumber: false,
		        /**
				 * 分页
				 * <PRE>
				 * 默认'none'
				 * 可选值
				 * none: 不分页
				 * up: 上分页
				 * down: 下分页
				 * all: 上下分页
				 * </PRE>
				 * @memberof grid-class
				 * @property {String} [pager=none] 分页
				 */
		        pager: 'none',
				/**
				 * 分页栏上的打印和导出按钮是否显示
				 * @memberof grid-class
				 * @property {Object} [pagerToolbarIcon] 
				 * @property {Boolean} [pagerToolbarIcon.download=false] 不显示下载按钮
				 * @property {Boolean} [pagerToolbarIcon.print=false] 不显示打印按钮
				 */
		        pagerToolbarIcon: {
		        	download: false,
		        	print: false
		        },
		        /**
				 * 默认当前页
				 * @memberof grid-class
				 * @property {Number} [pageNumber=1] 默认当前页
				 */
				pageNumber: 1,
				/**
				 * 每页默认的结果数
				 * @memberof grid-class
				 * @property {Number} [pageSize=10] 每页默认的结果数
				 */
				pageSize: 10,
				/**
				 * 可选择设定的每页结果数
				 * @memberof grid-class
				 * @property {Array} [pageList=10, 15, 20, 50, 100, 200] 可选择设定的每页结果数
				 */
				pageList: [10, 15, 20, 50, 100, 200],
				/**
				 * 主视图列
				 * @memberof grid-class
				 * @property {Array<Array>} [columns] 主视图列
				 */
				columns: null,
				/**
				 * 左固定列
				 * @memberof grid-class
				 * @property {Array<Array>} [frozenColumns] 左固定列
				 */
				frozenColumns: null,
				/**
				 * 右视图列
				 * @memberof grid-class
				 * @property {Array<Array>} [frozenColumnsRight] 右视图列
				 */
				frozenColumnsRight: null,
				/**
				 * 是否对编辑过的数据进行标记
				 * @memberof grid-class
				 * @property {Boolean} [markChange=false] 不标记
				 */
				markChange: false,
				/**
				 * 网格是否可编辑的总开关
				 * @memberof grid-class
				 * @property {Boolean} [editable=true] 可编辑
				 */
				editable: true,
				/**
				 * 设置了如何去解析从Server端传回来的json数据
				 * @memberof grid-class
				 * @property {Object} [jsonReader] json定义
				 * @property {Number} [jsonReader.total=totalRecords] 总记录数字段
				 * @property {Object} [jsonReader.rows=data] 主数据字段
				 * @property {Object} [jsonReader.footer=footer] 合计数据字段
				 */
				jsonReader: {
					/**
					 * 总记录数
					 */
					total: 'totalRecords',
					/**
					 * 表格数据
					 */
					rows: 'data',
					/**
					 * 表格尾数据
					 */
					footer: 'footer'
				},
				/**
				 * 初始查询参数
				 * <PRE>
				 * 已用关键字：page、rows、sort、order、__transor
				 * </PRE>
				 * @memberof grid-class
				 * @property {Object} [queryParams] 查询参数
				 */
				queryParams: null,
				/**
				 * 自定义面板的jquery表达式
				 * <PRE>
				 * 组件根据 $A(headerCustom) 取得面板 eg. #query
				 * </PRE>
				 * @memberof grid-class
				 * @property {String} [headerCustom] jquery表达式
				 */
				headerCustom: null,
				/**
				 * 初始化网格时 自动加载数据
				 * @memberof grid-class
				 * @property {Boolean} [autoLoad=true] 标志
				 */
				autoLoad: true,
				/**
				 * 自适应填充宽度
				 * <PRE>
				 * 默认为N 不自适应
				 * 可选值：
				 * N：[no] 不进行自适应填充
				 * ES: [extend&shrink]将列宽进行伸长/缩短以填充满表格，取消横向滚动
				 * E: [extend]将列框进行伸展以填充满表格，取消横向滚动
				 * </PRE>
				 * @memberof grid-class
				 * @property {Boolean} [fitColumns='N'] 标志
				 */
				fitColumns: 'E',
				/**
		         * 自定义合计栏的配置
		         * <PRE>
		         * summary.method 计算的函数，如果函数为空，则使用网格的data进行替换模板
		         * summary.template 模板
		         * </PRE>
		         * @property {Object} [summary] 自定义合计栏的配置
		         * @property {Function} [summary.method] 合计的计算方法
		         * @property {template} summary.template 模板
		         * @memberof grid-class
		         */
		        summary: null,
		      	/**
		         * 合计栏所在位置 可选值 top bottom
		         * @property {String} [summaryPos=bottom] 合计栏所在位置
		         * @memberof grid-class
		         */
		        summaryPos: 'bottom',
		        /**
		         * 网格列是否可以调整宽度
		         * <PRE>
				 * 1、默认为'true'，可以调整列宽
				 * </PRE>
		         * @property {Boolean} [columnResizable=true] 允许调整列宽
		         * @memberof grid-class
		         */
		        columnResizable: true,
		        /**
				 * 是否点击数据行开始编辑
				 * @memberof grid-class
				 * @property {Boolean} [autoBeginEdit=true] 开始编辑
				 */
				autoBeginEdit: true,
				/**
				 * 是否点击非数据行结束编辑
				 * @memberof grid-class
				 * @property {Boolean} [autoEndEdit=true] 结束编辑
				 */
				autoEndEdit: true,
				/**
				 * 是否使用编辑器的代理删除按钮
				 * 该参数在有编辑器的情况下生效
				 * @memberof grid-class
				 * @property {Boolean} [editorDelBtn=true] 使用
				 */
				editorDelBtn: true,
				/**
				 * 要合并的列名
				 * @memberof grid-class
				 * @property {Array<String>} [mergeColumns] 要自动合并的列
				 */
				mergeColumns: null,
				/**
				 * 是否允许进行列的隐藏/显示操作
				 * @memberof grid-class
				 * @property {Boolean} [columnManager=true] 允许
				 */
				columnManager: true,
				/**
				 * 每次双击必须间隔毫秒数
				 */
				dblOnce: 1000,
				/**
				 * 定位编辑器上边的编辑器
				 * @memberof grid-class
				 * @property {Array<Number>} [keyUpEditor=App.keyCode.UP] 按键值数组
				 */
				keyUpEditor: [App.keyCode.UP],
				/**
				 * 定位编辑器下边的编辑器
				 * @memberof grid-class
				 * @property {Array<Number>} [keyDownEditor=App.keyCode.DOWN] 按键值数组
				 */
				keyDownEditor: [App.keyCode.DOWN],
				/**
				 * 定位编辑器左边的编辑器
				 * @memberof grid-class
				 * @property {Array<Number>} [keyLeftEditor=App.keyCode.LEFT] 按键值数组
				 */
				keyLeftEditor: [App.keyCode.LEFT],
				/**
				 * 定位编辑器右边的编辑器
				 * @memberof grid-class
				 * @property {Array<Number>} [keyRightEditor=App.keyCode.RIGHT] 按键值数组
				 */
				keyRightEditor: [App.keyCode.RIGHT],
				/**
				 * 是否启用特殊按键[keyNextEditor、keyPrevEditor、keyAppendRow、keyDeleteRow]
				 * @memberof grid-class
				 * @property {Boolean} [keySpecEnabled=true]
				 */
				keySpecEnabled: true,
				/**
				 * 定位编辑器的下一个编辑器
				 * @memberof grid-class
				 * @property {Array<Number>} [keyNextEditor=[App.keyCode.ENTER, App.keyCode.TAB]] 按键值数组
				 */
				keyNextEditor: [App.keyCode.ENTER, App.keyCode.TAB],
				/**
				 * 定位编辑器的上一个编辑器
				 * @memberof grid-class
				 * @property {Array<Number>} [keyPrevEditor=[{keyCode:App.keyCode.TAB, shiftKey:true}]] 按键值数组
				 */
				keyPrevEditor: [{keyCode:App.keyCode.TAB, shiftKey:true}],
				/**
				 * 追加一行到末尾
				 * @memberof grid-class
				 * @property {Array<Number>} [keyPrevEditor=[{keyCode:App.keyCode.PLUS, ctrlKey:true}]] 按键值数组
				 */
				keyAppendRow: [{keyCode:App.keyCode.PLUS, shiftKey:true}],
				/**
				 * 删除当前编辑行
				 * @memberof grid-class
				 * @property {Array<Number>} [keyPrevEditor=[{keyCode:App.keyCode.MINUS, ctrlKey:true}]] 按键值数组
				 */
				keyDeleteRow: [{keyCode:App.keyCode.MINUS, shiftKey:true, ctrlKey:true}]

			},
			/**
			 * 网格的列属性
			 * @class
			 * @classdesc 表格
			 * @name gridColumn
			 */
			Column: {
				/**
				 * 列属性
				 * @property {String} field 列属性
				 * @memberof gridColumn
				 */
				field: null,
				/**
				 * 列标题
				 * <PRE>操作列配置按钮，title配置为数字，该数字代表buttons的索引，且按钮不加入数据域</PRE>
				 * @property {String} title 列标题
				 * @memberof gridColumn
				 */
				title: null,
				/**
				 * 列公式
				 * <PRE>表达式可以直接使用当前行变量
				 * 	表达式内提供下列三个特殊方法功能动态维度列使用
				 * 		getNum(field)
				 * 		getStr(field)
				 * 		sumSuffix(suffixStr)</PRE>
				 * @property {String} formula 计算表达式
				 * @memberof gridColumn
				 */
				formula: null,
				/**
				 * 合并列
				 * @property {Number} [colspan] 合并列
				 * @memberof gridColumn
				 */
				colspan: null,
				/**
				 * 合并行
				 * @property {Number} [rowspan] 合并行
				 * @memberof gridColumn
				 */
				rowspan: null,
				/**
				 * 宽度
				 * @property {Number} [Column.width=100] 宽度
				 * @memberof gridColumn
				 */
				width: 100,
				/**
				 * 打印宽度单位mm
				 * @property {Number} [Column.printWidth] 打印宽度
				 * @memberof gridColumn
				 */
				printWidth: null,
				/**
				 * 打印数据类型
				 * <PRE>
				 * String 字符串
				 * Number0 整型的数值
				 * Number1 保留1位小数的数值
				 * Number2 保留2位小数的数值
				 * Number3 保留3位小数的数值
				 * Number4 保留4位小数的数值
				 * Number5 保留5位小数的数值
				 * Number6 保留6位小数的数值
				 * </PRE>
				 * @property {String} [Column.printType=String] 默认为字符串类型
				 * @memberof gridColumn
				 */
				printType: 'String',
				/**
				 * 固定列
				 * 可选值: left, right
				 * @property {String} [Column.frozen] 固定
				 * @memberof gridColumn
				 */
				frozen: null,
				/**
				 * 隐藏
				 * @property {Number} [Column.hidden=false] 隐藏
				 * @memberof gridColumn
				 */
				hidden: false,
		        /**
				 * 对齐方式 可选值 center left right
				 * @property {String} [Column.align=center] 对齐方式
				 * @memberof gridColumn
				 */
		        align: 'center',
		        /**
		         * 可排序
		         * @property {Boolean} [sortable=false] 对齐方式
		         * @memberof gridColumn
		         */
		        sortable: false,
		        /**
		         * 自定义排序函数，用来做局部排序
		         * @property {Function} [sorter] 排序函数
		         * @property {Object} sorter.a 第一个值
		         * @property {Object} sorter.b 第二个值
		         * @example {title: '自定义排序方法',align:'right',field: 'f3',
		         * &#9;sortable:true,
		         * &#9;sorter: function(a,b){
		         * &#9;&#9;return a.f3 - b.f3;
		         * &#9;}
		         * }
		         * @memberof gridColumn
		         */
		        sorter: null,
		        /**
		         * 返回样式字符串定制的单元格样式的函数
		         * @property {Function} [styler] 样式函数
		         * @property {String} styler.val 值
		         * @property {Object} styler.row 行数据对象
		         * @property {index} styler.i 行号
		         * @example {title: '样式修改列',field: 'f2',
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
		        styler: null,
		        /**
		         * 格式化配置
		         * <PRE>
		         * 1、函数类型： 自定义编写的函数
		         * 该函数接收选中四个参数，分别为该单元格的值，行实体对象，行号，列。函数返回一个字符串作为显示值
				 * 2、数值格式化：指定格式化串 [#,###.00]
				 * 3、字符串连接：使用{}包裹变量
				 * 4、内置格式化方法：内置格式化方法编码
		         * </PRE>
		         * @property {Function|String} [formatter] 格式化
		         * @property {String} formatter.value 值
		         * @property {Object} formatter.row 行数据对象
		         * @property {Number} formatter.rowIndex 行号
		         * @property {GridColumn} formatter.column 列
		         * @example {title: '格式化显示列',align:'left',field: 'f1',
		         * &#9;formatter:function(value,row,rowIndex,column){
		         * &#9;&#9;return '格式化列';
		         * &#9;}
		         * }
		         * @example {title: 'f1显示f2的值',align:'left',field: 'f1', formatter:'[#,###.00]'}
		         * @example {title: 'f1显示f2的值',align:'left',field: 'f1', formatter:'{f1}-{f2}'}
		         * @example {title: 'f1显示f2的值',align:'left',field: 'f1', formatter:'oneYesZeroNo'}
		         * @memberof gridColumn
		         */
		        formatter: null,
		        /**
		         * 编辑器设置
		         * @property {Object} [editor] 格式化函数
		         * @property {String} editor.type 编辑器类型
		         * @property {Object} editor.options 编辑器初始化属性[详见个组件]
		         * @example {
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
		        editor: null,
		        /**
		         * 单元格按钮
		         * @property {Array} [buttons] 主数据单元格中的按钮
		      	 * @property {String} [buttons.text] 标题
				 * @property {String} [buttons.iconCls] 样式
				 * @property {Function|Boolean} [buttons.disabled] 是否可用
				 * @property {Function} [buttons.handler] 操作
				 * @property {Object} [buttons.handler.rowData] 行数据
				 * @property {Number} [buttons.handler.rowIndex] 行号
				 * @example {
				 * &#9;title : '操作',
				 * &#9;width : 200,
				 * &#9;buttons:[ {
				 * &#9;&#9;text : '编辑',
				 * &#9;&#9;iconCls : 'btn-edit',
				 * &#9;&#9;disabled : true,
				 * &#9;&#9;handler : function(rowData, rowIndex) {
				 * &#9;&#9;&#9;$('#gridEditorOnClickTr').grid('beginEdit', rowIndex);
				 * &#9;&#9;}
				 * &#9;} , {
				 * &#9;&#9;text : '撤销编辑',
				 * &#9;&#9;iconCls : 'btn-reset',
				 * &#9;&#9;disabled : function(rowData, rowIndex) {
				 * &#9;&#9;&#9;return rowIndex%2==0?true:false;
				 * &#9;&#9;},
				 * &#9;&#9;handler : function(rowData, rowIndex) {
				 * &#9;&#9;&#9;$('#gridEditorOnClickTr').grid('cancelEdit', rowIndex);
				 * &#9;&#9;}
				 * &#9;} , {
				 * &#9;&#9;text : '应用编辑',
				 * &#9;&#9;iconCls : 'btn-start',
				 * &#9;&#9;handler : function(rowData, rowIndex) {
				 * &#9;&#9;&#9;$('#gridEditorOnClickTr').grid('acceptChange', rowIndex);
				 * &#9;&#9;}
				 * &#9;}
				 * }
		         * @memberof gridColumn
		         */
		        buttons: null,
		        /**
		         * 数据列是否提示浮动的title
		         * @property {Boolean} [showTitle=false] 标志
		         * @memberof gridColumn
		         */
		        showTitle: false,
		        /**
		         * 合计值选项
		         * <PRE>
		         * summary.type 可选值：
		         * &#9;&#9;sum: 合计值
		         * &#9;&#9;avg：平均值
		         * &#9;&#9;min：最小值
		         * &#9;&#9;max：最大值
		         * &#9;&#9;count：计数值
		         * summary.text 要输出的值
		         * </PRE>
		         * @property {Object} [summary] 合计值选项
		         * @property {String} [summary.type] 类型
		         * @property {String} [summary.text] 文字
		         * @memberof gridColumn
		         */
		        summary: null,
		        /**
		         * 网格列是否可以调整宽度
		         * @property {Boolean} [resizable=true] 允许调整列宽
		         * @memberof gridColumn
		         */
		        resizable: true,
		        /**
		         * 是否为行头
		         * @property {Boolean} [rowHeader=false] 不是行头
		         * @memberof gridColumn
		         */
		        rowHeader: false,
		        /**
		         * 是否作为 列隐藏/显示树 的节点
		         * @property {Boolean} [showTree=true] 允许
		         * @memberof gridColumn
		         */
		        showTree: true,
		        /**
		         * 是否锁定列隐藏/显示操作，锁定将不允许用户进行列的隐藏/显示操作
		         * @property {Boolean} [lockTree=false] 允许
		         * @memberof gridColumn
		         */
		        lockTree: false
			},
			Combogrid: {
				/**
				 * 要加载数据的url，也可以通过action设置
				 * @memberof combogrid-class
				 * @property {Url} [url] url数据源
				 */
				url: '',
				/**
				 * <span class="type-signature static">override</span>
				 * 下拉面板的高度
				 * @memberof combogrid-class
				 * @property {Number} [panelheight=297] 下拉面板的高度
				 */
				panelheight: 297,
				/**
				 * 是否允许多选 也可以由checkbox来设置该属性
				 * s.multiple = s.checkbox || s.multiple;
				 * @memberof combogrid-class
				 * @property {Boolean} [multiple=false] 多选
				 */
				multiple: false,
				/**
				 * 联想过滤时使用的匹配属性，多个属性使用,分隔
				 * <PRE style="color:red;">
				 * 当没有配置该属性时，默认使用textfield
				 * 远程联想时 可以通过_key接收输入的搜索关键字、suggestfield接收该字段的配置
				 * </PRE>
				 * @memberof combogrid-class
				 * @property {String} [suggestfield] 匹配属性
				 */
				suggestfield: '',
				/**
				 * 是否允许网格搜索
				 * @todo 当下拉网格不分页时，根据当前页面的数据进行匹配
				 * @todo 当下拉网格存在分页，则根据url进行远程匹配
				 *          远程用 _key 来接受检索关键字，suggestfield来接受检索的匹配属性
				 * </PRE>
				 * @memberof combogrid-class
				 * @property {boolean} [search=false] 允许网格搜索
				 */
				search: false,
				/**
				 * 延迟搜索时间（毫秒）
				 * @memberof combogrid-class
				 * @property {Object} [lazy=500] 延迟搜索时间（毫秒）
				 */
				lazy: 500,
				/**
				 * 允许联想
				 * @memberof combogrid-class
				 * @property {Boolean} [usesuggest=false] 允许联想
				 */
				usesuggest: false,
				/**
				 * 下一页
				 * @memberof combogrid-class
				 * @property {Array} keyNextPage=[App.keyCode.RIGHT] 按键值数组
				 */
				keyNextPage: [App.keyCode.RIGHT],
				/**
				 * 上一页
				 * @memberof combogrid-class
				 * @property {Array} keyPrevPage=[App.keyCode.LEFT] 按键值数组
				 */
				keyPrevPage: [App.keyCode.LEFT],
				className: 'app-combogrid',
				/**
				 * <span class="type-signature static">override</span>
				 * 下拉表格内部表格的默认设置
				 * @see {@link grid} 查看grid组件
				 * @memberof combogrid-class
				 * @property {Object} Grid 下拉表格内部表格的默认设置
				 * @property {Boolean} [Grid.pagerToolbar=false] 上分页与标题栏同行
				 * @property {Boolean} [Grid.rownumbers='repeat'] 网格行号
				 * @property {Boolean} [Grid.autoHeight=true] 自动增高模式
				 * @property {Boolean} [Grid.follow=all] 头/尾跟随滚动
				 * @property {Number} [Grid.clickDelay=0] 单击确认毫秒数
				 */
				Grid:{
					/**
					 * 上分页是否与工具栏同行，false则与标题栏同行
					 */
			        pagerToolbar: false,
					/**
					 * 网格行号
					 */
					rownumbers: 'repeat',
					/**
					 * 内置的网格尾固定高度
					 * 网格头/尾 不跟随滚动
					 */
					follow: null,
					/**
					 * 单击确认毫秒数
					 */
					clickDelay: 0
				}
			},
			Checkbox:{
				/**
				 * 数据对象中作为隐藏值的属性名
				 * @memberof checkbox-class
				 * @property {String} [valuefield=id] 隐藏值属性名
				 */
				valuefield: 'id',
				/**
				 * 数据对象中作为显示值的属性名
				 * @memberof checkbox-class
				 * @property {String} [textfield=name] 显示值属性名
				 */
				textfield: 'name',
				/**
				 * 可以勾选的个数
				 * @memberof checkbox-class
				 * @property {number} [checkLen=0] 0不做限制
				 */
				checkedLen: 0,
				/**
				 * 布局方式，默认为水平布局，可选为：'horizontal' | 'vertical'
				 * @memberof checkbox-class
				 * @property {Array} orient=[horizontal]
				 */
				orient: 'horizontal'
			},
			progressbar: {
				/**
				 * 宽度 默认与父元素宽度相同
				 * @memberof progressbar-class
				 * @property {String} [width=auto] 进度条的宽度
				 */
				width: 'auto',
				/**
				 * 进度值
				 * @memberof progressbar-class
				 * @property {Number} [value=0] 进度值
				 */
				value : 0,
				/**
				 * 高度
				 * @memberof progressbar-class
				 * @property {String} [height=20px] 高度
				 */
				height: '20px',
				/**
				 * 背景色
				 * @memberof progressbar-class
				 * @property {String} [background-color=#4AAE98] 背景色
				 */
				'background-color': '#4AAE98',
				/**
				 * 进度值的前景色
				 * @memberof progressbar-class
				 * @property {String} [color=black] 前景色
				 */
				color: 'black',
				/**
				 * 是否显示条纹
				 * @memberof progressbar-class
				 * @property {String} [striped=true] 显示条纹
				 */
				striped: true,
				/**
				 * 进度最大值
				 * @memberof progressbar-class
				 * @property {String} [max=100] 进度最大值
				 */
				max: 100
			},
			upload: {
				/**
				 * 上传的url
				 * @memberof upload-class
				 * @property {url} uploadUrl=attachment/upload.do 上传的url
				 */
				uploadUrl: 'attachment/upload.do',
				/**
				 * 是否初始化已上传的文件
				 * @memberof upload-class
				 * @property {Boolean} [requestFile=false] 初始化已上传的文件
				 */
				requestFile: false,
				/**
				 * 获取已上传文件的url
				 * @memberof upload-class
				 * @property {url} [fileUrl=attachment/getFiles.do] 获取已上传文件的url
				 */
				fileUrl: 'attachment/getFiles.do',
				/**
				 * 删除已上传文件的url
				 * @memberof upload-class
				 * @property {url} [deleteUrl=attachment/delete.do] 删除已上传文件的url
				 */
				deleteUrl: 'attachment/delete.do',
				/**
				 * 工具栏的位置 可选值 top|bottom
				 * @memberof upload-class
				 * @property {Boolean} [toolbarPosition=top] 工具栏的位置
				 */
				toolbarPosition: 'top',
				/**
				 * 顶层的css样式
				 * @memberof upload-class
				 * @property {style} [style] 顶层的css样式
				 */
				style: '',
				/**
				 * 顶层的class类名
				 * @memberof upload-class
				 * @property {Class} [css] 顶层的class类名
				 */
				css: '',
				/**
				 * 设置宽度后为平铺显示文件
				 * @memberof upload-class
				 * @property {Class} [fileWidth] 文件项的宽度
				 */
				fileWidth: '',
				/**
				 * 文件是否可以删除
				 * @memberof upload-class
				 * @property {Class} [canDelete=false] 不能删除文件
				 */
				canDelete: false,
				/**
				 * 文件的扩展名
				 * @memberof upload-class
				 * @property {String} [exts] 文件的扩展名
				 * @example exts=".zip,.jpg,.rar"
				 */
				exts: '',
				/**
				 * 上传文件按钮的文本
				 * @memberof upload-class
				 * @property {String} [uploadBtnText=上传文件] 上传文件按钮的文本
				 */
				uploadBtnText: '上传文件',
				/**
				 * 可以上传多个文件
				 * @memberof upload-class
				 * @property {Boolean} [multiple=true] 上传多个文件
				 */
				multiple: true
			},
			Button:{
				/**
				 * id
				 * @memberof Button
				 * @property {String}
				 */
				id : null,
				 /**
				 * 是否禁用
				  * @memberof Button
			      * @property {Boolean} [value=false]
				 */
				disabled : false,
				/**
				 * 是否切换元素的可见状态
				* @memberof Button
			 	* @property {Boolean} [value=false]
				 */
				toggle : false,
				/**
				 * 是否选中,当toggle为true有有效
				 * @memberof Button
			 	 * @property {Boolean} [selected=false]
				 * 是否选中
				 */
				selected : false,
				/**
				 * 按钮组.当group值一样时，认为是一组按钮
				 * @memberof Button
			 	 * @property {String} [group='']
				 */
				group : null,
				plain : false,
				/**
				 * @memberof Button
			 	 * @property {String} [text='']
				 * 按钮文本
				 */
				text : "",
				/**
				 * @memberof Button
			 	 * @property {String} [iconCls='']
				 * ico图标样式
				 */
				iconCls : null,
				/**
				 * ico对齐方式
				 * @memberof Button
			 	 * @property {String} [iconCls='left']
				 */
				iconAlign : "left",
                /**
                 * 按钮大小
                 * @memberof Button
                 * @property {String} [iconCls='small'] 小按钮 small,large
                 */
			    size: 'small',	// small,large
                /**
                 * 按钮点击事件
                 * @event Button#onClick
                 * @property {Function} [onClick=emptyFunction]
                 */
				onClick: function(){}
			},
			MenuButton : {
                className:'app-menubutton',
                /**
				 * 禁用启用
				 *  @memberof menututton
			 	 * @property {Boolean} [disabled=false]
				 */
				disabled: false,
				/**
				 * 是否为平面按钮
				 *  @memberof menututton
			 	 * @property {Boolean} [plain=false]
				 */
				plain: true,
				/**
				 * 绑定的菜单id
				 * @memberof menututton
			 	 * @property {String} [menu='']
			 	 * @example menu="#menu1"
				 */
				menu: null,
				/**
				 * 定义了时间以毫秒为单位显示菜单时，悬停按钮
				 * @memberof menututton
			 	 * @property {Number} [duration=100]
			 	 * @example duration=100
				 */
				duration: 100
			},
			Menu: {
                className:'app-menu',
                zIndex:110000,
				left: 0,
				top: 0,
				alignTo: null,
				align: 'left',
				minWidth: 120,
				duration: 100,	// Defines duration time in milliseconds to hide when the mouse leaves the menu.
				hideOnUnhover: true,	// Automatically hides the menu when mouse exits it
				onShow: function(){},
				onHide: function(){},
				onClick: function(item){}
			},
			Panel:{
				/**
				 * @memberof panel
			 	 * @property {String} [id='']
				 * 面板id
				 */
				id:null,
				/**
				 * 面板内间距
				 * @memberof panel
			 	 * @property {String} [padding='0 0 0 0']
				 */
				paddings:"0 0 0 0",
				margins:"0 0 0 0",
				/**
				 * @memberof panel
			 	 * @property {String} [title='']
				 * 面板标题
				 */
				title:null,
				/**
				 * @memberof panel
			 	 * @property {String} [width='auto']
				 * 面板宽度
				 */
				width: 'auto',
				/**
				 * @memberof panel
			 	 * @property {String} [height='auto']
				 * 面板高度
				 */
				height: 'auto',
				/**
				 * @memberof panel
			 	 * @property {String} [left=null]
				 * 面板定位横向坐标
				 */
				left: null,
				/**
				 * @memberof panel
			 	 * @property {String} [top=null]
				 * 面板定位纵向坐标
				 */
				top: null,
				/**
				 * @memberof panel
			 	 * @property {String} [cls=null]
				 * 面板附加样式
				 */
				cls: null,
				/**
				 * @memberof panel
			 	 * @property {String} [headerCls=null]
				 * 面板头部附加样式名
				 */
				headerCls: null,
				/**
				 * @memberof panel
			 	 * @property {String} [bodyCls=null]
				 * 内容体附加样式名
				 */
				bodyCls: null,
				/**
				 * @memberof panel
			 	 * @property {String} [style={}]
				 * 面板样式
				 */
				style: {},
				/**
				 * @memberof panel
			 	 * @property {String} [href=null]
				 * ajax地址
				 */
				href: null,
				/**
				 * @memberof panel
			 	 * @property {String} [cache=true]
				 * 是否缓存
				 */
				cache: true,
				/**
				 * @memberof panel
			 	 * @property {String} [fit=false]
				 * 是否自适应父级控件，放在layout有效
				 */
				fit: false,
				/**
				 * @memberof panel
			 	 * @property {String} [border=true]
				 * 就否显示面板边框
				 */
				border: true,
				/**
				 * @memberof panel
			 	 * @property {String} [doSize=true]
				 *  true to set size and do layout
				 */
				doSize: true,
				/**
				 * @memberof panel
			 	 * @property {String} [noheader=false]
				 *  是否显示标题头
				 */
				noheader: false,
				/**
				 * @memberof panel
			 	 * @property {String} [content=null]
				 * 面板内容体
				 */
				content: null,	// the body content if specified
				/**
				 * @memberof panel
			 	 * @property {String} [collapsible=false]
				 * 是否可收缩
				 */
				collapsible: false,
				/**
				 * @memberof panel
			 	 * @property {String} [minimizable=false]
				 * 是否最小化
				 */
				minimizable: false,
				/**
				 * @memberof panel
			 	 * @property {String} [maximizable=false]
				 * 是否最大化
				 */
				maximizable: false,
				/**
				 * @memberof panel
			 	 * @property {String} [closable=false]
				 * 是否可关闭
				 */
				closable: false,
				/**
				 * @memberof panel
			 	 * @property {String} [collapsed=false]
				 * 收缩状态
				 */
				collapsed: false,
				/**
				 * @memberof panel
			 	 * @property {String} [minimized=false]
				 * 最小化状态
				 */
				minimized: false,
				/**
				 * @memberof panel
			 	 * @property {String} [maximized=false]
				 * 最大化状态
				 */
				maximized: false,
				/**
				 * @memberof panel
			 	 * @property {String} [closed=false]
				 * 关闭状态
				 */
				closed: false,
				extractor:null,
				method : "get",
				/**
				 * @memberof panel
			 	 * @property {String} [queryParams={}]
			 	 * ajax加载参数
				 */
				queryParams : {},
				loader:function(){},
				tools: [],
				loadingMessage: 'Loading...',
				/**
				 * @memberof panel
			 	 * @fires Panel#onLoad
			 	 * 打开前事件
				 */
				onLoad: function(){},
				/**
				 * @memberof panel
			 	 * @fires Panel#onBeforeOpen
			 	 * 打开前事件
				 */
				onBeforeOpen: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onOpen
			 	 * 打开事件
				 */
				onOpen: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onBeforeClose
			 	 * 关闭前事件
				 */
				onBeforeClose: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onClose
			 	 * 关闭事件
				 */
				onClose: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onClose
			 	 * 注销前事件
				 */
				onBeforeDestroy: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onClose
			 	 * 注销事件
				 */
				onDestroy: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onResize
			 	 * @property {Number} width
			 	 * @property {Number} height
			 	 * 注销事件
				 */
				onResize: function(width,height){},
				/**
				 * @memberof panel
			 	 * @event Panel#onMove
			 	 * 移动事件
				 */
				onMove: function(left,top){},
				/**
				 * @memberof panel
			 	 * @event Panel#onMaximize
			 	 * 最大化事件
				 */
				onMaximize: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onRestore
			 	 * 重置事件
				 */
				onRestore: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onMinimize
			 	 * 最小化事件
				 */
				onMinimize: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onMinimize
			 	 * 收缩前事件
				 */
				onBeforeCollapse: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onBeforeExpand
			 	 * 展开前事件
				 */
				onBeforeExpand: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onBeforeExpand
			 	 * 收缩展开监听
				 */
				onCollapse: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onBeforeExpand
			 	 * 展开事件
				 */
				onExpand: function(){}
		}

		},
		/**
		 * 统一的zindex定义
		 */
		zindexs:{
			droppanel:2000,
			dialog:1001,
			dialogMask:1000,
			dialogBack:999
		},
		dataTable:{
			iDisplayLength: 20,
		    aLengthMenu: [[20, 50, 100], [20, 50, 100]],
			bServerSide: true,
			bProcessing: false,
			bDeferRender:false,
			sAjaxDataProp:"data",
			pageListLength:10
		},
		pagination:{
			pageSize:20,
			listLength:10,
			pageSizeMenu: [20, 50, 100]
		},
		flexigrid:{
			rpOptions:[20, 50, 100]
		},
		jqgrid:{
			pageList:[20, 50, 100]
		},
		simpletree:{
			selected:"selected",
			exp:"center_expandable",
			coll:"center_collapsable",
			firstExp:"first_expandable",
			firstColl:"first_collapsable",
			lastExp:"last_expandable",
			lastColl:"last_collapsable",
			expandIcon:"icon-folder-close",
			folderIcon:"icon-folder-open",
			oneExp:"one_expandable",
			oneColl:"one_collapsable",
			leafIcon:"icon-file",
			ck:"checked",
			unck:"unchecked"
		},
		getPlugins:function(){
			var plugins=[];
			for(var plugin in this.appDefaults){
				plugins.push({pluginName:plugin.toLowerCase(),className:this.appDefaults[plugin].className});
			}
			return plugins;
		}
	};
	return App.options;
});