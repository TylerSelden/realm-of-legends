// each keyword must not contain spaces!!
var commands = [
  {
    keywords: ["saveusers"],
    func: (user, text) => {
      if (!user.admin) {
        user.connection.sendmsg("Your account does not have admin rights.", null, "l");
        return;
      }
      user.connection.sendmsg("Saving userdata...");
      process.saveUsers();
      user.connection.sendmsg("Userdata saved.", null, "l");
    }
  },
  {
    keywords: ["look", "examine", "read"],
    func: (user, text) => {
      text = text.split(" ");
      text.shift();
      if (text.length < 1) {
        user.connection.sendmsg("you stupid", null, "l");
      } else {
        user.connection.sendmsg(`You are reading: ${text.join(" ")}.`, null, "l");
      }
    }
  }
]

module.exports = commands;