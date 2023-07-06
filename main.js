const webSocketServer = require('websocket').server;
var http = require('http');

var port = 8080;

var httpServ = http.createServer();
httpServ.listen(port);
var server = new webSocketServer({ httpServer: httpServ });

var clients = [];

server.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  connection.send("Welcome!");
  
  clients.push(connection);
  connection.on('message', function(msg) {
    msg = msg.utf8Data;
    connection.send(msg);
  });
});