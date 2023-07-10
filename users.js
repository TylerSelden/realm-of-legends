const crypto = require('crypto');
const { sendmsg } = require('./utils.js');
const { connect } = require('http2');
const art = require('./art.js');

var users = {
  "kaius": {
    passwd: "912ec803b2ce49e4a541068d495ab570",
    race: "elf",
    height: "tall",
    hairColor: "brown"
  },
  "asdf": {
    passwd: "912ec803b2ce49e4a541068d495ab570",
    race: "orc",
    height: "short",
    hairColor: "silver"
  }
};

function character(passwd, race, height, hairColor) {
  this.passwd = passwd;
  this.race = race;
  this.height = height;
  this.hairColor = hairColor;

  return this;
}

const hairColors = ["black","brown","blonde","red","auburn","silver","white","brunette","chestnut"];
const heights = ["very tall", "tall", "average in height", "short", "very short"];

const races = [
  {
    name: "Human",
    description: "Versatile and adaptable, humans possess a diverse range of skills and abilities, making them capable of excelling in various roles within the land. Humans are proficient in Wisdom."
  },
  {
    name: "Elf",
    description: "Graceful and attuned to nature, elves are known for their agility, keen senses, and mastery of archery and magic. Elves are proficient in Dexterity."
  },
  {
    name: "Dwarf",
    description: "Resilient and skilled craftsmen, dwarves are renowned for their sturdy physique, exceptional endurance, and expertise in mining and forging. Dwarves are proficient in Constitution."
  },
  {
    name: "Dragonborn",
    description: "Ancient and wise, dragonborn embody power and arcane knowledge, carrying the blood of dragons within them. Dragonborn are proficient in Intelligence."
  },
  {
    name: "Centaur",
    description: "Majestic and swift, centaurs possess both the strength of a horse and the intellect of a humanoid, making them exceptional warriors and natural leaders. Centaurs are proficient in Charisma."
  },
  {
    name: "Orc",
    description: "Fierce and formidable, orcs are born warriors, known for their physical strength, ferocity in battle, and indomitable spirit. Orcs are proficient in Strength."
  }
]

function md5(str) {
  return crypto.createHash('md5').update(str).digest("hex");
}

var login = [
  function(connection, username) {
    username = username.replace(/[^a-zA-Z-_]/g, '').toLowerCase();
    connection.username = username;

    connection.sendmsg(username);
    if (users[username] !== undefined) {
      connection.sendmsg(`Welcome back, ${username}. Password: `, login[1], "nl");
    } else {
      connection.sendmsg(`Ah, ${username}, you say? Alas, that name remains untold within these hallowed realms. Would you like to create a new account? [Y/n] `, login[2], "nl");
    }
  },
  function(connection, text) {
    connection.sendmsg('*'.repeat(text.length));
    var hash = md5(text);
    if (users[connection.username].passwd == hash) {
      var user = users[connection.username];
      connection.sendmsg(`Successfully logged in.\nThe Beta has not been programmed further than this, ${connection.username}.\n\nYour character's appearance:\nYou are ${connection.username}, a ${user.race} who is ${user.height} and has ${user.hairColor} hair.`, null, "d500v");
      //// start the game
    } else {
      connection.sendmsg("Incorrect password, try again: ", null, "nld3000");
    }
  },
  function(connection, text) { // 2
    connection.sendmsg(text);
    var choice = ynChoice(connection, text, 2, "Would you like to create a new account?");
    if (choice == undefined) return;

    if (choice) {
      connection.sendmsg(`\nWelcome to the Land of Ambia, ${connection.username}. Before you get started, we need to ask a few questions about your character.`);
      connection.sendmsg(`First, you'll need to set a password for your account: `, login[3], "nl");
    } else {
      connection.sendmsg("What be thy name, adventurer?", login[0], "l");
    }
  },
  function(connection, text) {
    connection.passwd = md5(text);
    connection.sendmsg('*'.repeat(text.length));
    connection.sendmsg("Re-enter password: ", login[4], "nl");
  },
  function(connection, text) {
    connection.sendmsg('*'.repeat(text.length));
    var hash = md5(text);
    if (connection.passwd == hash) {
      connection.sendmsg("Your password has been set.");
      connection.sendmsg('\n' + art.racelist, login[5], "l");
    } else {
      connection.sendmsg("Passwords do not match, try again. Enter password: ", login[3], "nl");
    }
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = numberedChoice(connection, text, 5, 1, 6);
    if (choice == -1) return;

    connection.race = races[choice].name;
    connection.sendmsg(`${races[choice].name}:`);
    connection.sendmsg(races[choice].description);
    connection.sendmsg("\nIs this the race you want to select for your character? [Y/n] ", login[6], "nl");
  },
  function(connection, text) { //6
    connection.sendmsg(text);
    var choice = ynChoice(connection, text, 6, "Is this the race you want to select for your character?");
    if (choice == undefined) return;

    if (choice) {
      connection.sendmsg(`Your character's race has been set to ${connection.race}.`);
      connection.sendmsg(`\nFinally, you'll need to customize your character's appearance, to make it stand out from everybody else.`);
      connection.sendmsg(art.characterHairColor, login[7], "l");
    } else {
      connection.sendmsg(art.racelist, login[5], "l");
    }
  },
  function(connection, text) { //7
    connection.sendmsg(text);
    var choice = numberedChoice(connection, text, 7, 1, 9);
    if (choice == -1) return;

    connection.hairColor = hairColors[choice];
    connection.sendmsg(`\nWould you like your character to have ${connection.hairColor} hair? [Y/n] `, login[8], "nl");
  },
  function(connection, text) { //8
    connection.sendmsg(text);
    var choice = ynChoice(connection, text, 8, `Would you like your character to have ${connection.hairColor} hair?`);
    if (choice == undefined) return;

    if (choice) {
      connection.sendmsg(`Your character's hair color has been set to ${connection.hairColor}.`);
      connection.sendmsg('\n' + art.characterHeight, login[9], "l");
    } else {
      connection.sendmsg(art.characterHairColor, login[7], "l");
    }
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = numberedChoice(connection, text, 9, 1, 5);
    if (choice == -1) return;

    connection.height = heights[choice];
    connection.sendmsg(`\nWould you like your character to be ${connection.height}? [Y/n] `, login[10], "nl");
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = ynChoice(connection, text, 10, `Would you like your character to be ${connection.height}?`);
    if (choice == undefined) return;

    if (choice) {
      connection.sendmsg(`\nYou are ${connection.username}, a ${connection.race} who is ${connection.height} and has ${connection.hairColor} hair.`);
      connection.sendmsg("Is this description correct (this cannot be changed)? [Y/n] ", login[11], "nl");
    } else {
      connection.sendmsg(art.characterHeight, login[9], "l");
    }
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = ynChoice(connection, text, 11, "Is this description correct (this cannot be changed)?");
    if (choice == undefined) return;

    if (choice) {
      connection.sendmsg(`Congratulations ${connection.username}, you have completed your character!`);
      connection.sendmsg("This is as far as the Beta goes,")
      // here we go
    } else {
      connection.sendmsg('\n' + art.racelist, login[5], "l");
    }
  }
]

function numberedChoice(connection, text, index, min, max) {
  var choice = parseInt(text);
  if (isNaN(choice)) {
    connection.sendmsg("Please enter a valid number: ", login[index], "nl");
    return -1;
  } else if (choice < min || choice > max) {
    connection.sendmsg(`Please enter a number between ${min} and ${max}: `, login[index], "nl");
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
    connection.sendmsg(`Invalid option. ${invalidMsg} [Y/n] `, login[index], "nl");
  }
}

module.exports = { users, login };