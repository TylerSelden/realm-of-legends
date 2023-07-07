const crypto = require('crypto');

var users = {
  "asdf": {
    passwd: "6a204bd89f3c8348afd5c77c717a097a"
  }
};

var login = [
  function(connection, username) {
    username = username.replace(/[^a-zA-Z-_]/g, '');
    connection.username = username;

    if (users[username] !== undefined) {
      connection.callback = login[1];
      connection.send(`Welcome back, ${username}.`);
      connection.send("Password: ");
      connection.locked = false;
    } else {
      connection.send("that account doesn't exist :/");
    }
  },
  function(connection, text) {
    var hash = crypto.createHash('md5').update(text).digest("hex");
    if (users[connection.username].passwd == hash) {
      connection.send(" ");
      setTimeout(() => {
        connection.send("Successfully logged in.");
        connection.locked = false;
        connection.validated = true;

        //// start the game for the player
      }, 500);
    } else {
      connection.send(" ");
      setTimeout(() => {
        connection.send("Incorrect password, try again.");
        connection.locked = false;
      }, 3000);
    }
  }
]

module.exports = { users, login };