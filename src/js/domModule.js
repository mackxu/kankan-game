/**
 * Dom模块
 * 自定义DOM相关的函数操作 
 * mDom.$(id)
 * mDom.getElements(classname, tagname, root)
 * mDom.children(element)
 * ======================== CSS =======
 * mDom.addClass(element, classname)
 * mDom.removeClass(element, classname)
 * mDom.hasClass(element, classname) Boolean
 * mDom.show(element)
 * mDom.hide(element)
 * 获取计算样式
 * mDom.getComputedStyle(element)
 * 元素的大小和位置
 * ===========================
 * mDom.ready(fn)	DOM加载完毕后触发
 * 
 */
var mDom = (function(window) {
	var document = window.document;
	var my = {};
	/**
	 * ID选择器查找
	 * 查找成功返回DOM对象,失败返回null
 	 * @param {String} id
	 */
	my.$ = function(id) {
		if(typeof id == 'string') {
			return document.getElementById(id);
		}
		return null;
	};
	/**
	 * 用类名或标记名获取元素集合
	 * 按标记名p获取集合 例如：
	 * getElements('', 'p')
	 * getElements(null, 'p', root);
	 * 按class选择器名获取集合例如：
	 * getElements('classname')
	 * getElements('classname', 'p')
	 * getElements('classname', '', root)
	 * getElements('classname', null, root)
	 * getElements('classname', 'p', root)
	 * @param {String} className
	 * @param {String} tagName
	 * @param {String} root
	 */
	my.getElements = function (className, tagName, root) {
		var root = root || document;		//避免了root值为null 或 undefined的情况
		if(typeof root == 'string') {
			root = document.getElementById(root);
		}
		var tagName = tagName || '*';
		var all = root.getElementsByTagName(tagName);
		//如果不存在className 是按HTML标签查找元素集合
		if(!className) { return all; }
		//通过className筛选元素
		/*if(root.getElementsByClassName) {
			return root.getElementsByClassName(className);
		}else {*/
		var elements = [];				//存储包含指定class值的元素
		for(var i=0, len=all.length; i< len; i++) {
			var element = all[i];
			if(my.hasClass(element, className)) {
				elements.push(element);
			}
		}
		return elements;				//返回按className查找的元素数组
	}
	/**
	 * element元素下的子元素
	 * @return Array
	 */
	my.children = function(element) {
		var children = [];			//存储子元素
		if(typeof element == 'string') {
			element = document.getElementById(element);
		}
		if(element == null) { return children; }
		if(element.children) { return element.children; }
		//获取不支持children属性的元素的子元素
		var childNodes = element.childNodes;
		var childNode;
		for(var i=0, len=childNodes.length; i<len; i++) {
			childNode = childNodes[i]; 
			if(childNode.nodeType == 1) {		//元素类型
				children.push(childNode);
			}
		}
		return children;
	}
	//================================ CSS =======
	/**
	 * 为元素e添加值为c的Class选择器
	 * @param {String/Array} e
	 * @param {String} c 
	 */		
	my.addClass = function(e, c) {
		if(typeof e == 'string') {
			e = document.getElementById(e);
		}
		if(e == null) { return; }
		if(!isElement(e)) {			//参数e是元素集合
			var len = e.length;
			while(len--) {
				arguments.callee(e[len], c);		//递归调用
			}
			return;					//处理完元素集合,直接结束
		}
		if(my.hasClass(e, c)) { return; }			//已经存在选择器c
		if(e.className) {			//如果不存在class属性返回空字符串
			c = ' ' + c;
		}
		e.className += c;
	};
	/**
	 * 移除指定值的class选择器
	 * 
	 */
	my.removeClass = function(e, c) {
		if(typeof e == 'string') {
			e = document.getElementById(e);
		}
		if(e == null) { return; }
		if(!isElement(e)) {			//参数e是元素集合
			var len = e.length;
			while(len--) {
				arguments.callee(e[len], c);		//递归调用
			}
			return;					//处理完元素集合,直接结束
		}
		var pattern = new RegExp('\\b'+c+'\\b\\s*', 'g');
		var className = e.className;		
		if(pattern.test(className)) {
			e.className = className.replace(pattern, '');
		}
	};
	/**
	 * 判断元素的class属性值是否包含c 
	 * 
	 */
	my.hasClass = function(e, c) {		
		if(typeof e == 'string') {
			e = document.getElementById(e);
		}
		if(!isElement(e)) { return false; }		//不是元素对象
		var className = e.className;		
		if(!className) { return false; }		//元素对象不存在class属性
		if(className == c) { return true; }		//只存在一个值c
		return className.search('\\b'+c+'\\b') != -1;	//class属性有多个值
	};
	
	my.show = function(elements) {
		showHide(elements, true);
	};
	my.hide = function(elements) {
		showHide(elements);
	};
	my.getComputedStyle = function(element) {
		//获取元素的计算样式
		if(isElement(element)) {
			if(window.getComputedStyle) {
				return window.getComputedStyle(element, null);
			}else if(element.currentStyle) {
				return element.currentStyle;
			}
		}
		return null;
	};
	//=====================================
	my.ready = function(fn){
		if(document.addEventListener) {
			document.addEventListener('DOMContentLoaded', function() {
				//注销事件, 避免反复触发
				document.removeEventListener('DOMContentLoaded', arguments.callee, false);
				fn();			//执行函数
			}, false);
		}else if(document.attachEvent) {		//IE
			document.attachEvent('onreadystatechange', function() {
				if(document.readyState == 'complete') {
					document.detachEvent('onreadystatechange', arguments.callee);
					fn();		//函数执行
				}
			});
		}
	};
	//----------------------------------- private method -------------
	/**
	 * 判断参数是否是HTMLCollection
	 * 如果是返回true, 否者返回false
 	 * @param {Object} HTMLCollection HTML集合
 	 * @private 私有方法
	 */
	function isHTMLCollection(collection) {
		if(collection != null) {
			//判断值obj为元素还是元素集合的做法：obj.length === undefined
			return collection.length === undefined? false : true;
		}
		return false;
	}
	/**
	 * 判断element是否是元素对象
	 */
	function isElement(element) {
		//element可能值： null
		if(element == null) { return false; }
		//element可能值: HTMLCollection
		return element.nodeType == 1? true : false;
	}
	/**
	 * 显示或隐藏元素
	 * @param {Object} elements
	 * @param {Object} show
	 */
	function showHide(elements, show) {		
		if(elements == null) { return; }
		//如果元素对象
		if(isElement(elements)) {
			elements = [elements];			//单元素转成数组的形式
		}
		var len = elements.length;
		var elem;
		while(len--) {
			elem = elements[len];
			if(!elem.style) {
				continue;			//如果elem不存在style属性 结束本趟循环
			}
			if(show) {
				elem.style.display = '';				
			}else {
				if(elem.style.display !== 'none') {
					elem.style.display = 'none';
				}	
			}
		}
	}
	
	return my;
})(window);


//----------------------------- tabs module  -------
var mTabs = (function(window, mDom){
	var my = {};
	var document = window.document;
	/**
	 * 初始化选项卡
	 * 第一个标题添加class="active"
	 * 只显示第一个选项卡内容
	 * @param {Array} headers 选项卡标题集合
	 * @param {Array} contents 选项卡内容集合
	 */
	my.init = function(headers, contents) {
		mDom.addClass(headers[0], 'active');
		mDom.hide(contents);
		mDom.show(contents[0]);
	}
	/**
	 * 选项卡单击标题事件
	 */
	my.clickEvent = function(event, headers, contents) {
		var target = getTarget(event);			//获取被单击的元素
		var index = search(target, headers);	//计算第几个选项卡标题被单击
		if(index != -1) {		//如果单击的元素是选项卡标题任意一个
			//只为被单击的标题添加.active, 清除其他的.active
			mDom.removeClass(headers, 'active');
			mDom.addClass(target, 'active');
			mDom.hide(contents);
			mDom.show(contents[index]);
		}
	}
	function getTarget(event) {
		event = event || window.event;
		return event.target || event.srcElement;
	}
	/**
	 * 查找数组元素的位置
	 * 返回元素在数组第一次出现的位置, 否者返回-1
	 * @param {Object} needle
	 * @param {Object} haystack
	 */
	function search(needle, haystack) {
		//这里假设了haystack是数组
		for(var i=0, len=haystack.length; i<len; i++) {
			if(haystack[i] == needle) {
				return i;
			}
		}
		return -1;
	}
	return my;
})(window, mDom);