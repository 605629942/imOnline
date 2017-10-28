//var log4js = require("log4js");  
//var log4js_config = require("./log4js.json");  //加载配置文件
//log4js.configure(log4js_config); 
//var LogFile = log4js.getLogger('log_date');
//LogFile.info('---the server is running---');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({    
    extended: true
}));
var server = app.listen(8217);//监听3000端口
var io = require('socket.io').listen(server);
console.log('the server is running;the port is 8217');
//LogFile.info('the server is running');  
var usockets = {};//保存客户端socket对象
io.on('connection',function(socket){
    //连接服务器事件
    socket.on('link service',function(data){
        console.log('the client user_id is '+data.user_id);
        if(typeof data.user_id == 'undefined'){
            return;//user_id是必须字段，为空直接返回
        }
        var user_id = data.user_id;
        usockets[user_id] = socket;
        if(typeof usockets[user_id] != 'undefined'){
            console.log('save client success');
        }
        //发射事件告诉客户端已经连接成功
        usockets[user_id].emit('link status',{code:1000,message:'连接成功'});
    });
    //新消息事件
    socket.on('new message',function(data){
        console.log('the callback user_id is '+data.user_id);
        if(typeof data.user_id == 'undefined'){
            return;
        }
        if(typeof usockets[data.user_id] == 'undefined'){
            return;
        }
        var user_id = data.user_id;
        //客户端广播消息
        usockets[user_id].emit('new message',data);
    });
    //离开事件
    socket.on('disconnect',function(data){
        //用户离开，销毁连接
        if(typeof data.user_id != 'undefined'){
            var user_id = data.user_id;
            delete usockets[user_id];
        }
    });
});
var client = require('socket.io-client');
var socket_client = client.connect('http://127.0.0.1:3000');
app.post('/',function(req,res){
    if(req.body.user_id && req.body.message){
        var user_id = req.body.user_id;
        var message = req.body.message;
        var data = {};
        data['message'] = message;
        data['user_id'] = user_id;
        socket_client.emit('new message',data);
        res.send(user_id);
    } else {
        //兼容非 Content-Type=application/json 情况
        var body = '', jsonStr;
        req.on('data', function (chunk) {
            body += chunk; //读取参数流转化为字符串
        });
        req.on('end', function () {
            //读取参数流结束后将转化的body字符串解析成 JSON 格式
            try {
                jsonStr = JSON.parse(body);
            } catch (err) {
                jsonStr = null;
            }
            if(jsonStr){
                var user_id = jsonStr.user_id;
                var message = jsonStr.message;
                if(user_id){
                    var data = {};
                    data['message'] = message;
                    data['user_id'] = user_id;
                    socket_client.emit('new message',data);
                    res.send(user_id);
                }
            }
        });
    }
    res.send('error');
});
app.get('/',function(req,res){
    var user_id = req.query.user_id;
    var message = req.query.message;
    if(user_id){
        var data = {};
        if(message){
            data['message'] = message;
        }
        data['user_id'] = user_id;
        socket_client.emit('new message',data);
        res.send(user_id);
    }
});
