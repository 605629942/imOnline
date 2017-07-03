
var express = require('express');
var app = express();
var server = app.listen(8217);
var io = require('socket.io').listen(server);
app.use(express.static(__dirname + '/app')); // app为Frontpage(index.html)所在文件夹
var userNum = 0;
io.on('connection',function(socket){
	//console.log(socket.id);return;socket.id是当前连接的客户端id，这里
	//socket.manager.transports[socket.id].socket.setTimeout(15000);
	var addUserStatus = false;
	//等待被连接
	socket.on('add user',function(username){
		if(addUserStatus){
			return;
		}
		socket.username = username;//把username保存到socket对象中
		++userNum;//聊天室人数+1，并且返回给前端
		addUserStatus = true;
		socket.emit('user login',{
			username:socket.username,
			userNum:userNum
		});
		//向其它用户广播这个用户加入了聊天室
		socket.broadcast.emit('user joined',{
			username:socket.username,
			userNum:userNum
		});
	});
	/*
	*用户发送消息，事件名称：send msg
	*@username string 发送消息的用户
	*@msg string 发送的消息
	*@type int 1：全员聊天 2：单独聊天
	*/
	socket.on('send message',function(data){
		//console.log(data);
		if(data.type == 1){
			//广播给所有用户
			socket.broadcast.emit('send msg',{
				username:socket.username,
				msg:data.message
			});
		}else{
			//单独聊天，广播给指定的人
		}

	});
	//监听disconnect事件，该事件在刷新浏览器以后由socket自动触发，然后服务器将消息广播给所有用户
	socket.on('disconnect',function(){
		if(addUserStatus == true){
				//将在线人数减一
				--userNum;
				socket.broadcast.emit('user left',{
					username:socket.username,
					userNum:userNum
				});
		}
	});
});