const crypto = require('crypto');
const { sendmsg } = require('./utils.js');
const { connect } = require('http2');

var users = {
  "kaius": {
    passwd: "912ec803b2ce49e4a541068d495ab570"
  }
};

var login = [
  function (connection, username) {
    username = username.replace(/[^a-zA-Z-_]/g, '').toLowerCase();
    connection.username = username;

    connection.sendmsg(username);
    if (users[username] !== undefined) {
      connection.sendmsg(`Welcome back, ${username}.\nPassword: `, login[1], "nl");
    } else {
      connection.sendmsg(`${username}, is it? That name is not recognized.\nWould you like to create a new account? [Y/n]`);
      connection.callback = login[2]
      connection.locked = false;
    }
  },
  function (connection, text) {
    connection.sendmsg('*'.repeat(text.length));
    var hash = crypto.createHash('md5').update(text).digest("hex");
    console.log(hash);
    if (users[connection.username].passwd == hash) {
      connection.sendmsg("successfully logged in.", null, "ld500v");
    } else {
      connection.sendmsg("Incorrect password, try again: ", null, "nld3000");
    }
  },
  function (connection, text) {
    if (text.toLowerCase() == 'y') {
      connection.sendmsg(`\n\n[Account creation process will go here]`);
      connection.sendmsg(`The Beta has not been programmed further than this, ${connection.username}.`);
    } else if (text.toLowerCase() == 'n') {
      connection.sendmsg("\nWhat be thy name, adventurer?", login[0], "l");
    }
  }
]

module.exports = { users, login };