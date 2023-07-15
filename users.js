const crypto = require('crypto');
const fs = require('fs');
const { stringify, parse } = require('circular-json');

// var art = require('./art.js');
require('./art.js');
var { loadRooms, rooms, handleInput } = require('./rooms.js')


process.connectedUsers = [];
process.users = {};

var currentUserVersion = 1.6;
function Character(passwd, race, height, hairColor) {
  this.passwd = passwd;
  this.race = race;
  this.height = height;
  this.hairColor = hairColor;
  
  this.room = [0, 0, 0];
  this.inventory = [];

  this.admin = false;

  this.version = currentUserVersion;

  return this;
}

function userIsOnline(username) {
  for (var i in process.connectedUsers) {
    if (process.connectedUsers[i] == username) return true;
  }
  return false;
}

const hairColors = ["black","brown","blonde","red","auburn","silver","white","brunette","chestnut"];
const heights = ["very tall", "tall", "average in height", "short", "very short"];

const races = [
  {
    name: "human",
    description: "Versatile and adaptable, humans possess a diverse range of skills and abilities, making them capable of excelling in various roles within the land. Humans are proficient in Wisdom."
  },
  {
    name: "elf",
    description: "Graceful and attuned to nature, elves are known for their agility, keen senses, and mastery of archery and magic. Elves are proficient in Dexterity."
  },
  {
    name: "dwarf",
    description: "Resilient and skilled craftsmen, dwarves are renowned for their sturdy physique, exceptional endurance, and expertise in mining and forging. Dwarves are proficient in Constitution."
  },
  {
    name: "dragonborn",
    description: "Ancient and wise, dragonborn embody power and arcane knowledge, carrying the blood of dragons within them. Dragonborn are proficient in Intelligence."
  },
  {
    name: "centaur",
    description: "Majestic and swift, centaurs possess both the strength of a horse and the intellect of a humanoid, making them exceptional warriors and natural leaders. Centaurs are proficient in Charisma."
  },
  {
    name: "orc",
    description: "Fierce and formidable, orcs are born warriors, known for their physical strength, ferocity in battle, and indomitable spirit. Orcs are proficient in Strength."
  }
]

function md5(str) {
  return crypto.createHash('md5').update(str).digest("hex");
}

process.login = [
  function(connection, username) {
    username = username.replace(/[^a-zA-Z-_]/g, '').toLowerCase();
    connection.username = username;
    connection.sendmsg(username);

    //check if user is already connected under same username
    var usernameIsOnline = userIsOnline(username);
    if (usernameIsOnline) {
      connection.sendmsg("Somebody is already connected under that username.", null);
      delete connection.username;
      setTimeout(() => {connection.close(), 500});
      return;
    }
    if (process.users[username] !== undefined && !usernameIsOnline) process.users[username].connection = connection;
    process.connectedUsers.push(username);
    //yikes that was intense

    if (process.users[username] !== undefined) {
      connection.sendmsg(`Welcome back, ${username}. Password: `, process.login[1], "nl");
    } else {
      connection.sendmsg(`Ah, ${username}, you say? Alas, that name remains untold within these hallowed realms. Would you like to create a new account? [Y/n] `, process.login[2], "nl");
    }
  },
  function(connection, text) {
    connection.sendmsg('*'.repeat(text.length));
    var hash = md5(text);
    if (process.users[connection.username].passwd == hash) {
      var user = process.users[connection.username];
      connection.sendmsg("Successfully logged in.", null, "d500");

      setTimeout(() => {process.start(connection)}, 700);
    } else {
      connection.sendmsg("Incorrect password, try again: ", null, "nld3000");
    }
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = ynChoice(connection, text, 2, "Would you like to create a new account?");
    if (choice == undefined) return;

    if (choice) {
      connection.sendmsg(`\nWelcome to the Land of Ambia, ${connection.username}. Before you get started, we need to ask a few questions about your character.`);
      connection.sendmsg(`First, you'll need to set a password for your account: `, process.login[3], "nl");
    } else {
      connection.sendmsg("What be thy name, adventurer?", process.login[0], "l");
    }
  },
  function(connection, text) {
    connection.passwd = md5(text);
    connection.sendmsg('*'.repeat(text.length));
    connection.sendmsg("Re-enter password: ", process.login[4], "nl");
  },
  function(connection, text) {
    connection.sendmsg('*'.repeat(text.length));
    var hash = md5(text);
    if (connection.passwd == hash) {
      connection.sendmsg("Your password has been set.");
      connection.sendmsg('\n' + process.art.racelist, process.login[5], "l");
    } else {
      connection.sendmsg("Passwords do not match, try again. Enter password: ", process.login[3], "nl");
    }
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = numberedChoice(connection, text, 5, 1, 6);
    if (choice == -1) return;

    connection.race = races[choice].name;
    connection.sendmsg(`${races[choice].name}:`);
    connection.sendmsg(races[choice].description);
    connection.sendmsg("\nIs this the race you want to select for your character? [Y/n] ", process.login[6], "nl");
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = ynChoice(connection, text, 6, "Is this the race you want to select for your character?");
    if (choice == undefined) return;

    if (choice) {
      connection.sendmsg(`Your character's race has been set to ${connection.race}.`);
      connection.sendmsg(`\nFinally, you'll need to customize your character's appearance, to make it stand out from everybody else.`);
      connection.sendmsg(process.art.characterHairColor, process.login[7], "l");
    } else {
      connection.sendmsg(process.art.racelist, process.login[5], "l");
    }
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = numberedChoice(connection, text, 7, 1, 9);
    if (choice == -1) return;

    connection.hairColor = hairColors[choice];
    connection.sendmsg(`\nWould you like your character to have ${connection.hairColor} hair? [Y/n] `, process.login[8], "nl");
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = ynChoice(connection, text, 8, `Would you like your character to have ${connection.hairColor} hair?`);
    if (choice == undefined) return;

    if (choice) {
      connection.sendmsg(`Your character's hair color has been set to ${connection.hairColor}.`);
      connection.sendmsg('\n' + process.art.characterHeight, process.login[9], "l");
    } else {
      connection.sendmsg(process.art.characterHairColor, process.login[7], "l");
    }
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = numberedChoice(connection, text, 9, 1, 5);
    if (choice == -1) return;

    connection.height = heights[choice];
    connection.sendmsg(`\nWould you like your character to be ${connection.height}? [Y/n] `, process.login[10], "nl");
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = ynChoice(connection, text, 10, `Would you like your character to be ${connection.height}?`);
    if (choice == undefined) return;

    if (choice) {
      connection.sendmsg(`\nYou are ${connection.username}, a ${connection.race} who is ${connection.height} and has ${connection.hairColor} hair.`);
      connection.sendmsg("Is this description correct (this cannot be changed)? [Y/n] ", process.login[11], "nl");
    } else {
      connection.sendmsg(process.art.characterHeight, process.login[9], "l");
    }
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = ynChoice(connection, text, 11, "Is this description correct (this cannot be changed)?");
    if (choice == undefined) return;

    if (choice) {
      connection.sendmsg(`Congratulations ${connection.username}, you have completed your character!`);
      connection.sendmsg(`Logging in...\n`);
      process.users[connection.username] = new Character(connection.passwd, connection.race, connection.height, connection.hairColor);
      process.users[connection.username].connection = connection;
      process.saveUsers();
      
      process.start(connection);
    } else {
      connection.sendmsg('\n' + process.art.racelist, process.login[5], "l");
    }
  }
]

function numberedChoice(connection, text, index, min, max) {
  var choice = parseInt(text);
  if (isNaN(choice)) {
    connection.sendmsg("Please enter a valid number: ", process.login[index], "nl");
    return -1;
  } else if (choice < min || choice > max) {
    connection.sendmsg(`Please enter a number between ${min} and ${max}: `, process.login[index], "nl");
    return -1;
  } else {
    choice--;
    return choice;
  }
}

function ynChoice(connection, text, index, invalidMsg) {
  if (text.toLowerCase() == 'y') {
    return true;
  } else if (text.toLowerCase() == 'n') {
    return false;
  } else {
    connection.sendmsg(`Invalid option. ${invalidMsg} [Y/n] `, process.login[index], "nl");
  }
}

process.getRoom = function(user) {
  return process.rooms[user.room[0]][user.room[1]][user.room[2]];
}

process.start = function(connection) {
  // ok so the game should like actually start here

  // give them a description of the room they're in
  connection.sendmsg(`\n${'='.repeat(81)}\n${process.getRoom(process.users[connection.username]).description}\n`, handleInput, "lv");
}

process.saveUsers = function() {
  // remove connections
  var cpy = parse(stringify(process.users));
  for (var i in cpy) {
    var user = cpy[i];
    delete user.connection;
  }
  var savestr = JSON.stringify(cpy, null, 2);
  fs.writeFileSync("./savedata/users.json", savestr);
}

process.restoreUsers = function() {
  console.log("Restoring user data...");
  var savestr = fs.readFileSync("./savedata/users.json");
  process.users = JSON.parse(savestr);
  // remove garbage
  console.log("Removing garbage and checking character versions...");
  var outdated = 0;
  for (var i in process.users) {
    var user = process.users[i];
    delete user.connection;
    if (user.version < currentUserVersion) {
      outdated++;
      userVersionUpdates[user.version](user);
    }
  }
  if (outdated > 0) {
    console.log(`${outdated} outdated user accounts were repaired.`);
    process.saveUsers();
  }
  console.log("User data loaded.");
}


//user version updates
function upgradeUserVersion(user) {
  var keys = Object.keys(userVersionUpdates);
  var nextKey = keys[keys.indexOf(user.version) + 1];
  if (userVersionUpdates[nextKey] == undefined) {
    user.version = currentUserVersion;
  } else {
    user.version = nextKey;
    userVersionUpdates[nextKey](user);
  }
}

var userVersionUpdates = {
  1.0: function(user) { // upgrades FROM 1.0
    user.room = [0, 0, 1];
    user.inventory = [];

    upgradeUserVersion(user, user.version);
  },
  1.5: function(user) {
    user.admin = false;

    upgradeUserVersion(user, user.version);
  }
}