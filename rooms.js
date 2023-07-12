const fs = require('fs');

var rooms = {};

function loadRooms() {
  console.log("Loading rooms...");
  var savestr = fs.readFileSync("./rooms/data.json");
  rooms = JSON.parse(savestr);
  console.log("Rooms loaded successfully.");
}

function handleInput(connection, text) {

}

module.exports = { loadRooms, rooms, handleInput }