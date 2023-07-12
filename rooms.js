const fs = require('fs');

process.rooms = {};

process.loadRooms = function() {
  console.log("Loading rooms...");
  var savestr = fs.readFileSync("./rooms/data.json");
  process.rooms = JSON.parse(savestr);
  console.log("Rooms loaded successfully.");
}

process.handleInput = function(connection, text) {
  connection.sendmsg(text);
  connection.sendmsg("So this is basically as far as I've programmed, but it should be pretty easy going from here on out :)");
}