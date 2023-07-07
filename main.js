const webSocketServer = require('websocket').server;
const http = require('http');
const art = require('./art.js');

const { users, login } = require('./users.js');


var port = 8080;

var httpServ = http.createServer();
httpServ.listen(port);
var server = new webSocketServer({ httpServer: httpServ });



server.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  connection.send(art.splash);

  connection.callback = login[0];
  connection.locked = false;
  connection.validated = false;

  connection.on('message', function(msg) {
    // do not accept input if locked
    if (connection.locked) return;
    connection.locked = true;
    msg = msg.utf8Data;

    if (connection.validated) {
      // use user account
      connection.send("WELCOME TO THE UNDERGROUNDDDD");
      setTimeout(() => {
        connection.send("(how was the fall...)");
      }, 3000);
    } else {
      connection.callback(connection, msg);
    }
  });
});