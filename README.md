# imOnline
-----------------------
## 如何使用
```
$ cd imOnline
$ npm install
$ node index
```
用浏览器访问:  `http://localhost:3000`

## 技术栈
+ 客户端：
	+ HTML
	+ CSS
	+ JavaScript
+ 服务端
	+ 全局环境:Node.js
	+ Web服务器框架:express
	+ 双向通信框架:socket.io 
		+  [官方API](https://coding.net/u/605629942xiatian/p/imOnline/git/blob/group/online-v1.0/docs/socket.io_API.md)
		+  [学习笔记](https://coding.net/u/605629942xiatian/p/imOnline/git/blob/group/online-v1.0/docs/socket.io%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0.md)

## APP要实现的功能
+ 用户登陆
+ 显示在线人数和列表
+ 用户上线/下线提醒
+ 服务器关闭/重启提醒
+ 显示用户正在打字
+ 群聊 （黑色字体）
+ 私聊 （蓝色字体）
+ 显示正在对谁说话

各项需求流程图见[流程图汇总](https://coding.net/u/605629942xiatian/p/imOnline/git/blob/group/online-v1.0/docs/imOnline%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E5%9B%BE.md)

## 参考链接
+ socket.io官方开源项目: [chat](https://github.com/socketio/socket.io/tree/master/examples/chat)
+ 前端大神nswbmw的聊天室项目：[N-chat](https://github.com/nswbmw/N-chat)

