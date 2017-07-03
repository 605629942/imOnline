/*
*常用工具类
*@author xiatian
*@date 2017-01-13
*/
function untils(){
	this.getUrlParam = function(name){
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
		var r = window.location.search.substr(1).match(reg);  //匹配目标参数
		if (r != null){
			return unescape(r[2]); 
		} 
		return null; //返回参数值
	}
	this.getName = function(len){
        len = len || 32;
		var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
		var maxPos = $chars.length;
		var str = '';
		for(var i = 0;i<len;i++) {
	　　　　str += $chars.charAt(Math.floor(Math.random() * maxPos));
	　　}
		return str;
	}
}