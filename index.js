/*服务器端程序*/
/*参考https://github.com/socketio/socket.io/blob/master/examples/chat/index.js*/
//创建HTTP服务器
var express = require('express');   //引入express模块
var app = express();	//新建express实例，即一个新的HTTP服务器
var server = app.listen(3000); //服务器监听3000端口
var io = require('socket.io').listen(server); //使用socket.io服务端库绑定服务器

//express.static()是express框架内置中间件(middleware)，用于静态文件服务，其参数为静态文件所在目录
//这行命令相当于建立URL与文件目录的route，静态文件目录无需出现在url中
// __dirname是nodejs全局变量，引用当前目录地址，"app"为静态文件(html/css/js等)所在目录
app.use(express.static(__dirname + '/app')); 


//Chatroom

var numUsers = 0; //用户数,每次用户数发生变化时传递给前端

io.on("connection", function(socket) {
    var addedUser = false;

    //监听客户端发出的'new message'事件
    socket.on('new message', function(data) {
        //告诉其它客户端执行'new message'事件
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data,
        });
    });

    //监听客户端发出的'add user'事件
    socket.on('add user', function(username) {
        if (addedUser) return; //如果用户已添加，则退出函数

        //为该客户端本次socket会话储存用户名
        socket.username = username;
        ++numUsers; //用户数加1
        addedUser = true;
        //发送客户端'login'事件和数据
        socket.emit('login', {
            numUsers: numUsers
        });

        //向其它用户广播：有人已经连接
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers,
        });
    });

    //当该用户发出'typing'事件时(正在输入),广播给其它用户
    socket.on('typing', function() {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    //当该用户停止输入时，广播给其它用户
    socket.on('stop typing', function() {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    //当用户离开时
    socket.on('disconnect', function () {
        if (addedUser) {    //如果用户存在
            --numUsers;

            //向其它用户广播
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers,
            });
        }
    });
});