const crypto = require('crypto');
const fs = require('fs');
const { stringify, parse } = require('circular-json');

// var art = require('./art.js');
require('./art.js');
var { loadRooms, rooms, handleInput } = require('./rooms.js')

const {red, green, blue, yellow, gray, white} = require('./colors.js');

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
    description: `Versatile and adaptable, humans possess a diverse range of skills and abilities, making them capable of excelling in various roles within the land. ${yellow}Humans${white} are proficient in ${blue}Wisdom.`
  },
  {
    name: "elf",
    description: `Graceful and attuned to nature, elves are known for their agility, keen senses, and mastery of archery and magic. ${yellow}Elves${white} are proficient in ${blue}Dexterity.`
  },
  {
    name: "dwarf",
    description: `Resilient and skilled craftsmen, dwarves are renowned for their sturdy physique, exceptional endurance, and expertise in mining and forging. ${yellow}Dwarves${white} are proficient in ${green}Constitution.`
  },
  {
    name: "dragonborn",
    description: `Ancient and wise, dragonborn embody power and arcane knowledge, carrying the blood of dragons within them. ${red}Dragonborn${white} are proficient in ${green}Intelligence.`
  },
  {
    name: "centaur",
    description: `Majestic and swift, centaurs possess both the strength of a horse and the intellect of a humanoid, making them exceptional warriors and natural leaders. ${red}Centaurs${white} are proficient in ${blue}Charisma.`
  },
  {
    name: "orc",
    description: `Fierce and formidable, orcs are born warriors, known for their physical strength, ferocity in battle, and indomitable spirit. ${yellow}Orcs${white} are proficient in ${red}Strength.`
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
      connection.sendmsg(`${red}Somebody is already connected under that username.`, null);
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
      connection.sendmsg(`Ah, ${yellow}${username}${white}, you say? Alas, that name remains untold within these hallowed realms. ${green}Would you like to create a new account? ${green}[Y/n]${white} `, process.login[2], "nl");
    }
  },
  function(connection, text) {
    connection.sendmsg('*'.repeat(text.length));
    var hash = md5(text);
    if (process.users[connection.username].passwd == hash) {
      var user = process.users[connection.username];
      connection.sendmsg(`${green}Successfully logged in.`, null, "d500");

      setTimeout(() => {process.start(connection)}, 700);
    } else {
      connection.sendmsg(`${red}Incorrect password, try again: ${white}`, null, "nld3000");
    }
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = ynChoice(connection, text, 2, `${green}Would you like to create a new account?`);
    if (choice == undefined) return;

    if (choice) {
      connection.sendmsg(`\nWelcome to ${red}The Land of Ambia${white}, ${connection.username}. Before you get started, we need to ask a few questions about your character.`);
      connection.sendmsg(`First, you'll need to set a ${red}password${white} for your account: `, process.login[3], "nl");
    } else {
      connection.sendmsg(`${green}What be thy name, adventurer?`, process.login[0], "l");
      process.removeFromArray(process.connectedUsers, connection.username);
      connection.username = undefined;
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
      connection.sendmsg(`${green}Your password has been set.`);
      connection.sendmsg('\n' + process.art.racelist, process.login[5], "l");
    } else {
      connection.sendmsg(`${red}Passwords do not match, try again.${white} Enter password: `, process.login[3], "nl");
    }
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = numberedChoice(connection, text, 5, 1, 6);
    if (choice == -1) return;

    connection.race = races[choice].name;
    connection.sendmsg(`${blue}${process.capitalizeFirst(races[choice].name)}:`);
    connection.sendmsg(races[choice].description);
    connection.sendmsg(`\nIs this the race you want to select for your character? ${green}[Y/n]${white} `, process.login[6], "nl");
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = ynChoice(connection, text, 6, `Is this the race you want to select for your character?`);
    if (choice == undefined) return;

    if (choice) {
      connection.sendmsg(`Your character's race has been set to ${yellow}${connection.race}.`);
      connection.sendmsg(`\nFinally, you'll need to customize your character's ${green}appearance${white}, to make it stand out from everybody else.`);
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
    connection.sendmsg(`\nWould you like your character to have ${red}${connection.hairColor} hair${white}? ${green}[Y/n]${white} `, process.login[8], "nl");
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = ynChoice(connection, text, 8, `Would you like your character to have ${red}${connection.hairColor} hair${white}?`);
    if (choice == undefined) return;

    if (choice) {
      connection.sendmsg(`Your character's hair color has been set to ${red}${connection.hairColor}.`);
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
    connection.sendmsg(`\nWould you like your character to be ${green}${connection.height}${white}? ${green}[Y/n]${white} `, process.login[10], "nl");
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = ynChoice(connection, text, 10, `Would you like your character to be ${green}${connection.height}${white}?`);
    if (choice == undefined) return;

    if (choice) {
      connection.sendmsg(`\nYou are ${red}${connection.username}${white}, a ${red}${connection.race}${white} who is ${red}${connection.height}${white} and has ${red}${connection.hairColor} hair.${white}`);
      connection.sendmsg(`Is this description correct (this cannot be changed)? ${green}[Y/n]${white} `, process.login[11], "nl");
    } else {
      connection.sendmsg(process.art.characterHeight, process.login[9], "l");
    }
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = ynChoice(connection, text, 11, `Is this description correct (${red}this cannot be changed${white})?`);
    if (choice == undefined) return;

    if (choice) {
      connection.sendmsg(`Congratulations ${green}${connection.username}${white}, you have completed your character!`);
      connection.sendmsg(`${green}Logging in...\n`);
      process.users[connection.username] = new Character(connection.passwd, connection.race, connection.height, connection.hairColor);
      process.users[connection.username].connection = connection;

      //// for dev
      // process.saveUsers();
      if (connection.username !== "test") process.saveUsers();
      
      firstStart(connection);
    } else {
      connection.sendmsg('\n' + process.art.racelist, process.login[5], "l");
    }
  }
]

function numberedChoice(connection, text, index, min, max) {
  var choice = parseInt(text);
  if (isNaN(choice)) {
    connection.sendmsg(`${red}Please enter a valid number: `, process.login[index], "nl");
    return -1;
  } else if (choice < min || choice > max) {
    connection.sendmsg(`${red}Please enter a number between ${min} and ${max}: `, process.login[index], "nl");
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
    connection.sendmsg(`${red}Invalid option.${white} ${invalidMsg} ${green}[Y/n]${white} `, process.login[index], "nl");
  }
}

function firstStart(connection) {
  connection.sendmsg(`${'\n'.repeat(81)}`);

  setTimeout(() => {
    connection.sendmsg("~ A game by Benti Studios ~");
    setTimeout(() => {
      connection.sendmsg("Welcome to...");
      setTimeout(() => {
        connection.sendmsg(process.art.title0);
        setTimeout(() => {
          connection.sendmsg(process.art.title1);
          setTimeout(() => {
            connection.sendmsg(process.art.title2);
            setTimeout(() => {
              process.start(connection);
            }, 6000);
          }, 500);
        }, 500);
      }, 4000);
    }, 4000);
  }, 2000);
}

process.start = function(connection) {
  // ok so the game should like actually start here

  // give them a description of the room they're in
  process.sendRoomData(process.users[connection.username], "lv", process.handleInput);
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