const webSocketServer = require('websocket').server;
const http = require('http');
const art = require('./art.js');


var port = 8080;

var httpServ = http.createServer();
httpServ.listen(port);
var server = new webSocketServer({ httpServer: httpServ });

var clients = [];

server.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  connection.send(art.splash);

  clients.push(connection);
  connection.on('message', function(msg) {
    msg = msg.utf8Data;
    connection.send(`Welcome, ${msg}.`);
  });
});