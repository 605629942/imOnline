//创建HTTP服务器
var express = require('express');
var app = express();
var server = app.listen(3001);

var net = require('net');
const HOST = '127.0.0.1';
const PORT = 3000;
/*(var msg = {
    userId:3001
};
*/
var msg = 'faawefew';
//console.log(Buffer.byteLength(msg));
var option = {host:HOST,port:PORT};
var client = net.connect(option,function(){
    client.write(msg);
    client.on('data',function(msg){
        console.log('the server msg is :'+msg);
        client.destroy();
    });
});