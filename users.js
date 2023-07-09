const crypto = require('crypto');
const { sendmsg } = require('./utils.js');
const { connect } = require('http2');
const art = require('./art.js');

var users = {
  "kaius": {
    passwd: "912ec803b2ce49e4a541068d495ab570"
  }
};

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
      connection.sendmsg("successfully logged in.", null, "ld500v");
    } else {
      connection.sendmsg("Incorrect password, try again: ", null, "nld3000");
    }
  },
  function(connection, text) {
    connection.sendmsg(text);
    if (text.toLowerCase() == 'y') {
      connection.sendmsg(` Welcome to the Land of Ambia, ${connection.username}. Before you get started, we need to ask a few questions about your character.`);
      connection.sendmsg(`First, you'll need to set a password for your account: `, login[3], "nl");
    } else if (text.toLowerCase() == 'n') {
      connection.sendmsg("What be thy name, adventurer?", login[0], "l");
    } else {
      connection.sendmsg("Invalid option. Would you like to create a new account? [Y/n] ", login[2], "nl")
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
      connection.sendmsg(art.racelist, login[5], "l");
    } else {
      connection.sendmsg("Passwords do not match, try again. Enter password: ", login[3], "nl");
    }
  },
  function(connection, text) {
    connection.sendmsg(text);
    var choice = parseInt(text);
    if (isNaN(choice)) {
      connection.sendmsg("Please enter a valid number: ", login[5], "nl");
    } else if (choice < 1 || choice > 6) {
      connection.sendmsg("Please enter a number between 1 and 6: ", login[5], "nl");
    } else {
      choice -= 1;
      connection.sendmsg(`${races[choice].name}:`);
      connection.sendmsg(races[choice].description);
      connection.sendmsg("\nIs this the race you want? [Y/n] ", login[6], "nl");
    }
  },
  function(connection, text) {
    connection.sendmsg(text);
    if (text.toLowerCase() == 'y') {
      connection.sendmsg("ok cool beans.");
      //// finish this stuff up
    } else if (text.toLowerCase() == 'n') {
      connection.sendmsg(art.racelist, login[5], "l");
    } else {
      connection.sendmsg("Invalid option. Is this the race you want? [Y/n] ", login[6], "nl");
    }
  }
]

module.exports = { users, login };