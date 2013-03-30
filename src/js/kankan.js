/**
 * game kankan Module
 */
var mGame = (function(window, mDom) {
	var doc = window.document;
	var game = {};
	//是个二维数组 根据位置跟踪游戏数据 
	//值0: 原数据被擦除       undefined： 不存储数据、1-18  显示的数据 
	var nums = [];			 
	var paths = [];			//存储起点、终点、拐点详细信息
	var iContain = null;
	var pathContain = null; //存储通路路径单元
	var fragment;           //创建文档片段,添加高亮路径 减少重排,加快页面渲染
	var TABLE_LENGHT = 10;	//常量 路径的长度
	var MAX_DATA = 18;		//最大的数据
	var DATA_NUM = 36;		//数据个数
	var IBLOCK_LENGTH = 40;	//iBlock的长度
	/*
	 * 
	 */
	game.init = function(tableId, iContain) {
		//初始化位置数据,组建二位数组 10x10
		for(var i=0; i<TABLE_LENGHT; i++) {
			nums[i] = [];
		}
		//构建保存游戏数据的数组
		createTable(tableId);
		setIBlock(iContain);
		//查看nums位置和对应的数据
		for(var i=0; i<nums.length; i++) {
			var str = '';
			for (var j=0; j<nums[i].length; j++) {
				if(nums[i][j]) {
					str += 'nums['+i+']['+j+']='+nums[i][j]+' ';						
				}
			}
			console.log(str);
		}		
	}
	game.start = function(iContain, pathContain) {
		/*
		 * 为div#iContain添加click事件
		 * 利用事件委托 监听i的click行为
		 * 1. 判断起点终点 添加样式
		 * 2. 把起点终点添加到路径中
		 * 3. 判断通路
		 * 4.
		 */
		var iContain = mDom.$(iContain);
		pathContain = mDom.$(pathContain);
		var start = null, startInfo = null, end = null, endInfo = null;
		var win = DATA_NUM;               //每当通路一次减2，直到值为0
		iContain.onclick = function(event) {
			var event = event || window.event;
			var target = event.target || event.srcElement;
			//console.log(getIBlockInfo(target));
			//target.className = 'active';
			//console.log(target.tagName.toLowerCase() == 'i');
			//判断被点击的元素是起点或终点
			if(!start || (start && end)) {
				target.className = 'active';
				start = target;	//设置起点
				startInfo = getIBlockInfo(start);
				paths.push(startInfo);				   //起点为路径的第一个点
				end = null;						       //等待终点
			}else if(!end && start) {
				end = target;	//设置终点
				endInfo = getIBlockInfo(end);
				/*
				 * 判断终点和起点是否通路.满足的条件：
				 * 1、起点和终点不能是相同的i
				 * 2、起点和终点的页面显示的数字相同
				 * 3、起点和终点通路
				 */
				if((start.id != end.id) && (startInfo.value === endInfo.value) && isLoad(startInfo, endInfo)) {
					paths.push(endInfo);		     //终点是数组paths的最后一个元素
					end.className = 'active';
					showPath(pathContain);					     //创建并显示通路状态
					//从nums中删除起点、终点, 从iContain中起点终点i
					//iContain.removeChild(start);
					//iContain.removeChild(end);
					mDom.hide(start);
					mDom.hide(end);
					nums[paths[0].x][paths[0].y] = 0;
					nums[paths[paths.length-1].x][paths[paths.length-1].y] = 0;
					win -= 2;			//nums中数据个数减2
					//通路状态200ms后清除
					var timeoutId = setTimeout(function() {
						pathContain.innerHTML = '';	//清空通路状态
						paths = [];					//清空路径数组
						clearTimeout(timeoutId);	//有什么作用呢？
					}, 2000);
					if(win === 0) {
						alert('you win!!');
					}
				}else {
					//如果两点没有通路
					mDom.removeClass(start, 'active');
					paths = [];
				}
			}else {
				//
			}			
		}
		
	}
	game.test = function() {	
		setIBlock()
		console.log(nums);
	}
	//---------------------------- private method ---
	/**
	 * 获取目标的详细信息,以对象的形式返回
	 * @param {Object} iBlock DOM元素
	 */
	function getIBlockInfo(iBlock) {
		var i = {};             //存储i的信息 位置和数据
		var id = iBlock.id;
		var iNum = id.replace(/^i/, '');
		//获取iBlock的坐标(x,y)信息
		i.x = parseInt(iNum / 10, 10);
		i.y = parseInt(iNum % 10, 10);
		i.value = iBlock.innerHTML;
		//i.id = id;
		return i;
	}
	//判断是否通路
	/*
	 * 判断是否通路
	 * 通路的情况 ： 直线、一个拐点、二个拐点
	 * 
	 */
	function isLoad(startInfo, endInfo) {
		if(lineLoad(startInfo, endInfo)) return true;
		if(oneStop(startInfo, endInfo)) return true;
		if(twoStops(startInfo, endInfo)) return true;
		return false;
	}
	//判断直线上的两点是否通路
	function lineLoad(s, e) {
	    if(s.x == e.x) return lineX(s, e);
	    if(s.y == e.y) return lineY(s, e);
	}
	//水平线上的两点是否通路
	function lineX(s, e) {
	    var posY = twoSort(s.y, e.y);
	    //console.log(posY);
	    for(var y=posY[0]+1; y<posY[1]; y++) {
	        //console.log(nums[s.x][y]);
	        //如果存在值，说明两点之间有障碍物
	        if(nums[s.x][y]) return false;
	    }
	    return true;
	}
	//垂直方向上的两点是否通路
	function lineY(s, e) {
	    var posX = twoSort(s.x, e.x);
	    for(var x=posX[0]+1; x<posX[1]; x++) {
	        if(nums[x][s.y]) return false;
	    }
	    return true;
	}
	
	function twoSort(num1, num2) {
	    return [Math.min(num1, num2), Math.max(num1, num2)];
	}
	//处理中间有一个拐点的情况
	//起点和终点是矩形的对角线上的两点，另外两点是需要判断的拐点
	function oneStop(s, e) {
	    var posA = {}, posB = {};
	    //判断拐点是否是障碍物，如果不是继续
	    if(!nums[s.x][e.y]) {          //与s在同一水平线上
	        posA.x = s.x;
	        posA.y = e.y;
	        
	        //console.log(posA);
            if(lineX(s, posA) && lineY(e, posA)){
                paths.push(posA);       //添加拐点到路径中
                return true;
            }
	    }else if(!nums[e.x][s.y]) {    //拐点与s在垂直线上
	        posB.x = e.x;
	        posB.y = s.y;
	        
	        //console.log(posB);
            if(lineY(s, posB) && lineX(e, posB)){
                paths.push(posB);
                return true;
            }
	    }	    
	    return false;
	}
	//起点和终点的通路之间有二个拐点情况
	//判断s的四个方向是否有通路
	function twoStops(s, e) {
	    //left
	    var pos = {};              //找到第一拐点
	    for(var y=s.y-1; y>=0; y--) {
	        if(nums[s.x][y]) break;         //跳出循环
	        pos.x = s.x;
	        pos.y = y;
	        if(oneStop(pos, e)) {
	            paths.push(pos);
	            return true;
	        }
	    }
	    //right
	    for(var y=s.y+1; y<10; y++) {
	        if(nums[s.x][y]) break;         //跳出循环
	        pos.x = s.x;
            pos.y = y;
            if(oneStop(pos, e)) {
                paths.push(pos);
                return true;
            }
	    }
	    //top
	    for(var x=s.x-1; x>=0; x--) {
	        if(nums[x][s.y]) break;
	        pos.x = x;
	        pos.y = s.y;
	        if(oneStop(pos, e)) {
                paths.push(pos);
                return true;
            }
	    }
	    //bottom
	    for(var x=s.x+1; x<10; x++) {
	        if(nums[x][s.y]) break;
            pos.x = x;
            pos.y = s.y;
            if(oneStop(pos, e)) {
                paths.push(pos);
                return true;
            }
	    }
	    return false;
	}
	//构建通路状态并显示
	function showPath(pathContain) {
		console.log(paths);
		//创建文档片段,添加高亮路径 减少重排,加快页面渲染
		fragment = doc.createDocumentFragment();
		//通路中有两个拐点
		if(paths.length == 4) {
		    insertPath(paths[0], paths[2]);
		    insertPath(paths[2], paths[1]);
		    insertPath(paths[1],paths[3]);
		}else if(paths.length) {
		    
		}		
		//把文档片段添加到div#pathContain中
		pathContain.appendChild(fragment);
	}
	
	function insertPath(pathA, pathB) {
	    var path;
	    if(pathA.x == pathB.x) {
	        path = twoSort(pathA.y, pathB.y);
	        for(var y=path[0]; y<=path[1]; y++) {
	            console.log({x:pathA.x, y:y});
	            createPathItem({x:pathA.x, y:y});
	        }
	    }else if(pathA.y = pathB.y) {
	        path = twoSort(pathA.x, pathA.x); {
	            for(var x=path[0]; x<=path[1]; x++) {
	                console.log({x:x, y:pathA.y});
	                createPathItem({x:pathA.x, y:y});
	            }
	        }
	    }
	}
	//创建高亮路径单元i元素,并把它添加到fragment中
	function createPathItem(item) {
	    var pathItem = doc.createElement('i');
	    pathItem.className = 'pathItem';
	    pathItem.style.top = (IBLOCK_LENGTH * item.x) +'px';
	    pathItem.style.left = (IBLOCK_LENGTH * item.y) + 'px';
	    fragment.appendChild(pathItem);
	}
	/*
	 * 10x10 表格 作为游戏路径
	 */
	function createTable(id) {
		var oTable = mDom.$(id);		
		if(oTable) {
			var oTableBody = doc.createElement('tbody');
			var row, cell;
			for(var i=0; i<TABLE_LENGHT; i++) {
				row = oTableBody.insertRow(-1);				//IE7 不支持
				for(var j=0; j<TABLE_LENGHT; j++) {
					cell = row.insertCell(-1);
					cell.innerHTML = i+'*'+j;
				}
			}
			oTable.appendChild(oTableBody);
		}
	}
	
	/*
	 * 根据路径位置存储游戏数据到二维数组中并显示
	 * data[i][j] = k
	 * iBlock.style.left = j * IBLOCK_LENGTH + 'px';
	 * iBlock.style.top = i * IBLOCK_LENGTH + 'px';
	 */
	function setIBlock(iContain) {
		var data = getData(); 
		//var data = [1, 2, 1, 2, 2, 3, 2, 1, 2, 3, 2, 2, 1, 2, 2, 3, 1, 2];            //手动添加测试数据
		//console.log(data);
		iContain = mDom.$(iContain);
		var k = 0;
		var iBlock = null;
		var ecapse = {0:1, 3:1, 6:1, 9:1};
		for(var i=0; i<TABLE_LENGHT; i++) {
			if(ecapse[i]) { continue; }
			for(var j=0; j<TABLE_LENGHT; j++) {
				if(ecapse[j]) { continue; }
				nums[i][j] = data[k];			//保存位置数据
				//显示数据
				iBlock = doc.createElement('i');
				iBlock.id = 'i'+i+j;
				//i代表top每行 j代表left每列				
				iBlock.style.left = j * IBLOCK_LENGTH + 'px';			//此处需要px单位符号
				iBlock.style.top = i * IBLOCK_LENGTH + 'px';
				iBlock.appendChild(doc.createTextNode(data[k++]))
				iContain.appendChild(iBlock);
			}
		}
		//div#iContain之前被隐藏, 数据放好后一次性显示出来
		iContain.style.display = 'block';		
	}
	/*
     * 获取18对随机排列的数(不包括0)
     */
    function getData() {
        var tempArray = [];
        var once = [];
        var rand;
        for(var i=1; i<=DATA_NUM/2; i++) {
            once[i] = 0;             //18个数出现的次数默认为0
        }
        for(var i=0; i<DATA_NUM; i++) {
            rand = Math.ceil(Math.random() * MAX_DATA);
            if(once[rand] == 2) {
                i--;
                continue;
            }else {
                once[rand]++;       //每出现一次加1。可能值为1， 2
                tempArray.push(rand);                   //每次出现都要添加到数组中这样可以获得乱序排列的数字
            }
        }       
        return tempArray;
    }
	return game;
})(window, mDom);
