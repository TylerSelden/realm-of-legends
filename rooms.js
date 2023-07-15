const fs = require('fs');

// COMMANDS DO *NOT* CHANGE
const commands = require('./commands.js');

process.rooms = {};

process.loadRooms = function() {
  console.log("Loading rooms...");
  var savestr = fs.readFileSync("./rooms/data.json");
  process.rooms = JSON.parse(savestr);
  console.log("Rooms loaded successfully.");
}

process.handleInput = function(connection, text) {
  connection.sendmsg(text);
  var user = process.users[connection.username];

  runCommand(user, text);
}

function fuzzyFind(arr, str) {
  str += ' ';
  // exact matches
  for (var command of commands) {
    for (var keyword of command.keywords) {
      if (str.startsWith(keyword + ' ')) return command;
    }
  }

  // partial matches
  var matches = [];
  for (var command of commands) {
    for (var keyword of command.keywords) {
      if (keyword.startsWith(str.split(' ')[0])) matches.push(command);
    }
  }
  if (matches.length == 1) return matches[0];

  return null;
}

function runCommand(user, text) {
  var command = fuzzyFind(Object.keys(commands), text);
  if (command !== null) {
    command.func(user, text);
  } else {
    user.connection.sendmsg("That command couldn't be found.", null, "l");
  }
}