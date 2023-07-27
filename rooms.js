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

// function fuzzyFind(arr, str) {
//   str += ' ';
//   // exact matches
//   for (var command of commands) {
//     for (var keyword of command.keywords) {
//       if (str.startsWith(keyword + ' ')) return command;
//     }
//   }

//   // partial matches
//   var matches = [];
//   for (var command of commands) {
//     for (var keyword of command.keywords) {
//       if (keyword.startsWith(str.split(' ')[0])) matches.push(command);
//     }
//   }
//   if (matches.length == 1) return matches[0];

//   return null;
// }

process.fuzzyFind = function(arr, str) {
  if (typeof(arr) == "string") arr = [arr];
  
  str += ' ';
  str = str.toLowerCase();
  // exact matches
  for (var item of arr) {
    if (str.startsWith(item + ' ')) return item;
  }

  // partial matches
  var matches = [];
  for (var item of arr) {
    if (item.toLowerCase().startsWith(str.split(' ')[0])) matches.push(item);
  }
  if (matches.length == 1) return matches[0];

  return null;
}

process.fuzzyFindIndex = function(arr, str) {
  if (typeof(arr) == "string") arr = [arr];

  str += ' ';
  str = str.toLowerCase();
  // exact matches
  for (var i = 0; i < arr.length; i++) {
    var item = arr[i];
    if (str.startsWith(item + ' ')) return i;
  }

  // partial matches
  var matches = [];
  for (var i = 0; i < arr.length; i++) {
    var item = arr[i];
    if (item.toLowerCase().startsWith(str.split(' ')[0])) matches.push(i);
  }
  if (matches.length == 1) return matches[0];

  return null;
}


function runCommand(user, text) {
  var commandList = commands.map(a => a.keywords);
  var flatCommandList = commandList.flat(1);
  var commandKeyword = process.fuzzyFind(flatCommandList, text);

  // convert keyword to command
  var command = commands.find((command) => { return command.keywords.includes(commandKeyword) });

  if (commandKeyword !== null) {
    command.func(user, text);
  } else {
    user.connection.sendmsg("That command couldn't be found.", null, "l");
  }
}