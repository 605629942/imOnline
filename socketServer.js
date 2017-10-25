var net = require('net');
var server = net.createServer();
server.on('connection',function(client){
    //client.write('hi my name is xiatian');
    var buf;
    client.on('data',function(msg){
        //console.log('the client msg is :'+msg);
        /*var str = '';
        while(msg){
            str += msg;
        }
        */
        //console.log(msg);
        buf += msg;
        console.log(buf.toString(hex));
        client.write('hi my name is xiatian');
    });
});
console.log('the server is running');
server.listen(8217);