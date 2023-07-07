const crypto = require('crypto');
const { sendmsg } = require('./utils.js');
const { connect } = require('http2');

var users = {
  "asdf": {
    passwd: "6a204bd89f3c8348afd5c77c717a097a"
  }
};

var login = [
  function (connection, username) {
    username = username.replace(/[^a-zA-Z-_]/g, '');
    connection.username = username;

    if (users[username] !== undefined) {
      connection.send(username);
      connection.sendmsg(`\nWelcome back, ${username}.\nPassword: `, login[1], "nl");
    } else {
      connection.send(`${username}, is it? I haven't heard of a ${username} before.\nWould you like to create a new account? [Y/n]`);
      connection.callback = login[2]
      connection.locked = false;
    }
  },
  function (connection, text) {
    connection.sendmsg('*'.repeat(text.length));
    var hash = crypto.createHash('md5').update(text).digest("hex");
    if (users[connection.username].passwd == hash) {
      connection.sendmsg("successfully logged in.", null, "ld500v");
    } else {
      connection.sendmsg("Incorrect password, try again: ", null, "nld3000");
    }
  },
  function (connection, text) {

  }
]

module.exports = { users, login };