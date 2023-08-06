const webSocketServer = require('websocket').server;
const http = require('http');

// var art = require('./art.js');
require('./art.js');
// var { sendmsg } = require('./utils.js');
require('./utils.js');
// var { restoreUsers } = require('./users.js');
require('./users.js')
// var { loadRooms, rooms, handleInput } = require('./rooms.js')
require('./rooms.js');

require('./rooms/data.js');


var port = 8080;

var httpServ = http.createServer();
httpServ.listen(port);
var server = new webSocketServer({ httpServer: httpServ });

//startup routines
console.log("\nBeginning startup routines...");
process.restoreUsers();
process.loadRooms();
console.log("Startup routines finished!");
console.log(`Starting server on port ${port}.`)

server.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  connection.sendmsg = process.sendmsg;
  connection.sendmsg(process.art.splash, process.login[0], "l");
  connection.validated = false;

  connection.on('message', function(msg) {
    // do not accept input if locked
    if (connection.locked) return;
    connection.locked = true;
    msg = msg.utf8Data;

    if (connection.validated) {
      // use user account
      var user = process.users[connection.username];
      process.handleInput(connection, msg);
    } else {
      connection.callback(connection, msg);
    }
  });
  connection.on('close', function() {
    process.saveUsers();
    if (connection.username !== undefined) process.removeFromArray(process.connectedUsers, connection.username);
    if (connection.username == undefined || process.users[connection.username] == undefined) return;

    delete process.users[connection.username].connection;
  });
});


process.on('SIGINT', function() {
  console.log("Stopping server...");
  // screw disconnecting users gracefully, they can handle it.

  process.saveUsers();
  process.exit();
});