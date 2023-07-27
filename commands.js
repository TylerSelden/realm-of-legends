// each keyword must not contain spaces!!
var commands = [
  {
    keywords: ["n", "north"],
    func: (user, text) => {
      if (process.getRoom(user).exits.north == undefined) {
        return user.connection.sendmsg("You can't travel north.", null, "l");
      }

      user.room[1]--;
      user.connection.sendmsg("You travel north.");

      process.sendRoomData(user, "l");
    }
  },
  {
    keywords: ["e", "east"],
    func: (user, text) => {
      if (process.getRoom(user).exits.east == undefined) {
        return user.connection.sendmsg("You can't travel east.", null, "l");
      }

      user.room[0]++;
      user.connection.sendmsg("You travel east.");

      process.sendRoomData(user, "l");
    }
  },
  {
    keywords: ["s", "south"],
    func: (user, text) => {
      if (process.getRoom(user).exits.south == undefined) {
        return user.connection.sendmsg("You can't travel south.", null, "l");
      }

      user.room[1]++;
      user.connection.sendmsg("You travel south.");

      process.sendRoomData(user, "l");
    }
  },
  {
    keywords: ["w", "west"],
    func: (user, text) => {
      if (process.getRoom(user).exits.west == undefined) {
        return user.connection.sendmsg("You can't travel west.", null, "l");
      }
      user.room[1]--;
      user.connection.sendmsg("You travel west.");

      process.sendRoomData(user, "l");
    }
  },
  {
    keywords: ["quit"],
    func: (user, text) => {
      user.connection.sendmsg("\n\nThank you for playing The Tale of Ambia! Goodbye.");
      setTimeout(() => {user.connection.close()}, 500);
    }
  },
  {
    keywords: ["look", "examine", "read"],
    func: (user, text) => {
      text = text.trim().split(" ");
      text.shift();
      if (text.length < 1) {
        user.connection.sendmsg("What would you like to read?", null, "l");
      } else {
        text = text.join(" ").replace(/the |an |a /g, "").toLowerCase();
        var room = process.getRoom(user);
        var additionals = room.additionals.map(a => a.type);
        var readable = process.fuzzyFindIndex(text, additionals);

        if (readable !== null) {
          user.connection.sendmsg(`You read ${text}.`);
          user.connection.sendmsg(room.additionals[readable].data, null, "l");
        } else {
          user.connection.sendmsg(`You can't read that.`, null, "l");
        }
      }
    }
  }
]

module.exports = commands;