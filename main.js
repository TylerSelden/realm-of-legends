const webSocketServer = require('websocket').server;
var http = require('http');

var port = 8080;

var httpServ = http.createServer();
httpServ.listen(port);
var server = new webSocketServer({ httpServer: httpServ });

var clients = [];

server.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  connection.send(`
 ____  _____ ____  _     _        ____  _____   _     _____ _____ _____ _      ____  ____ 
/  __\\/  __//  _ \\/ \\   / \\__/|  /  _ \\/    /  / \\   /  __//  __//  __// \\  /|/  _ \\/ ___\\
|  \\/||  \\  | / \\|| |   | |\\/||  | / \\||  __\\  | |   |  \\  | |  _|  \\  | |\\ ||| | \\||    \\
|    /|  /_ | |-||| |_/\\| |  ||  | \\_/|| |     | |_/\\|  /_ | |_//|  /_ | | \\||| |_/|\\___ |
\\_/\\_\\\\____\\\\_/ \\|\\____/\\_/  \\|  \\____/\\_/     \\____/\\____\\\\____\\\\____\\\\_/  \\|\\____/\\____/

testing

testing`);

  clients.push(connection);
  connection.on('message', function(msg) {
    msg = msg.utf8Data;
    connection.send(msg);
  });
});