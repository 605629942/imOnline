var express = require('express');
var app = express();

app.get('/', function(req, res){
    var userId = req.query.userId;
    var message = req.query.message;
    if(userId){
        var io = require('socket.io-client');
        var socket = io.connect('http://127.0.0.1:3000');
        //socket.on('connect', function(){});
        var data = {from:'summer',msg:message,username:'summer',to:userId,mode:'private'};
        //console.log(data);
        socket.emit('new message',data);
    }
    
    res.send(userId);
});
app.listen(3001);

//socket.on('disconnect', function(){});
