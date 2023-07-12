const webSocketServer = require('websocket').server;
const http = require('http');

var art = require('./art.js');
var { sendmsg } = require('./utils.js');
var { users, login, restoreUsers } = require('./users.js');
var { loadRooms, rooms, handleInput } = require('./rooms.js')


var port = 8080;

var httpServ = http.createServer();
httpServ.listen(port);
var server = new webSocketServer({ httpServer: httpServ });

//startup routines
console.log("Beginning startup routines...");
restoreUsers();
loadRooms();

server.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  connection.sendmsg = sendmsg;
  connection.sendmsg(art.splash, login[0], "l");
  connection.validated = false;

  connection.on('message', function(msg) {
    // do not accept input if locked
    if (connection.locked) return;
    connection.locked = true;
    msg = msg.utf8Data;

    if (connection.validated) {
      // use user account
      connection.sendmsg(msg);
      var user = users[connection.username];
      console.log(connection.username, users);
      connection.sendmsg(`The Beta has not been programmed further than this, ${connection.username}.`);
      connection.sendmsg(`Your character's appearance:\nYou are ${connection.username}, a ${user.race} who is ${user.height} and has ${user.hairColor} hair.`);
    } else {
      connection.callback(connection, msg);
    }
  });
});