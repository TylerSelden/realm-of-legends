const webSocketServer = require('websocket').server;
const http = require('http');
const art = require('./art.js');

const { sendmsg } = require('./utils.js');
const { users, login } = require('./users.js');


var port = 8080;

var httpServ = http.createServer();
httpServ.listen(port);
var server = new webSocketServer({ httpServer: httpServ });



server.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  connection.sendmsg = sendmsg;
  connection.sendmsg(art.splash, login[0], "l");
  connection.validated = false;

  //// for development

  connection.username = "asdf";
  connection.passwd = "912ec803b2ce49e4a541068d495ab570";
  connection.callback = login[4];

  //// end

  connection.on('message', function(msg) {
    // do not accept input if locked
    if (connection.locked) return;
    connection.locked = true;
    msg = msg.utf8Data;

    if (connection.validated) {
      // use user account
      connection.sendmsg(msg);
      connection.sendmsg(`The Beta has not been programmed further than this, ${connection.username}.`);
    } else {
      connection.callback(connection, msg);
    }
  });
});