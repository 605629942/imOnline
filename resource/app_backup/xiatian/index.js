var WebSocketServer = require('ws').Server,
wss = new WebSocketServer({port:8217});//在该目录下安装ws 安装命令:npm install ws 启动node服务器 并且监听8217端口
//new ws({host:"111.117.111.240",port:8888});
/*wss.on('connection', function (ws) {//等待被客户端连接
    console.log('client connected');
    ws.on('message', function (message) {
        console.log(message);//接收客户端消息并且在控制台输出
    });
});
*/
//广播  
wss.broadcast = function broadcast(s,ws) {  
    // console.log(ws);  
    // debugger;  
    wss.clients.forEach(function each(client) {  
		//遍历所有已经连接的客户端
        // if (typeof client.user != "undefined") {  
            if(s == 1){  
                client.send(ws.name + ":" + ws.msg);  
            }  
            if(s == 0){  
                client.send(ws + "退出聊天室");    
            }  
        // }  
    });  
};
// 初始化  
wss.on('connection', function(ws) {  
    console.log('client connected');
    // console.log("在线人数", wss.clients.length);  
    ws.send('你是第' + wss.clients.length + '位');  
	console.log(wss);
    // 发送消息 
	//var serverObj = {"name":"系统消息","msg":"你好，欢迎来到聊天室"}
	//wss.broadcast(1,serverObj);  
    ws.on('message', function(jsonStr,flags) {
		//jsonStr是客户端发回来的对象
		//console.log('the client msg is '+jsonStr);
        var obj = eval('(' + jsonStr + ')'); 
        // console.log(obj);  
        this.user = obj;  
        if (typeof this.user.msg != "undefined") {  
            wss.broadcast(1,obj);  
        }  
    });  
    // 退出聊天  
    ws.on('close', function(close) {  
        try{  
            wss.broadcast(0,this.user.name);  
        }catch(e){  
            console.log('刷新页面了');  
        }  
    });  
});    