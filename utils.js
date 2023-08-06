const {red, green, blue, yellow, gray, white} = require('./colors.js');

// process.sendmsg = function(message, callback, flags) {
//   if (flags == undefined) flags = "";
//   /*
//     flags:
//     n: NO newline after message
//     l: unlock account
//     d3000: delay 3000 ms
//     v: validate connection
//     i: hide input symbol
//   */
//   var delay = 0;
//   if (flags.includes('d')) delay = parseInt(flags.match(/d(\d+)/)[1]);
//   if (flags.includes('v')) this.validated = true;

//   if (typeof(callback) == "function") this.callback = callback;

//   setTimeout(() => {
//     // this.send(message);
//     if (!flags.includes('n')) {
//       // this.send(`\n`);
//       message += '\n';
//     }
//     if (flags.includes('l')) {
//       this.locked = false;
//       if (!flags.includes('n')) /* this.send("> "); */ message += "> ";
//     }

//     // break message into line-sized pieces
//     var broken = message.split('\n');
//     for (var i = 0; i < broken.length; i++) {
//       if (broken[i].length > 81) {
//         var index = broken[i].lastIndexOf(" ", 81);
//         broken[i] = broken[i].substring(0, index) + '\n' + broken[i].substring(index + 1);
    
//         // Split the array again to prevent extra-long lines
//         broken = broken.join('\n').split('\n');
//         i = 0; // Restart the loop
//       }
//     }
    
    
//     message = broken.join('\n');
//     this.send(message);
//   }, delay);
// }

function visibleLength(str) {
  return str.replaceAll("​", "").length;
}

process.sendmsg = function (message, callback, flags) {
  if (flags == undefined) flags = "";
  /*
    flags:
    n: NO newline after message
    l: unlock account
    d3000: delay 3000 ms
    v: validate connection
    i: hide input symbol
    w: DO NOT start message with closing color tag (white)
  */
  var delay = 0;
  if (flags.includes('d')) delay = parseInt(flags.match(/d(\d+)/)[1]);
  if (flags.includes('v')) this.validated = true;

  if (typeof (callback) == "function") this.callback = callback;

  setTimeout(() => {
    // this.send(message);
    if (!flags.includes('n')) {
      // this.send(`\n`);
      message += '\n';
    }

    // this effectively resets the color at the end of a line automatically, unless flag w
    // if there is no closing color tag, and flag n, continue the color through the next message
    var colorElems = message.match(/<[^<>]*>/g);
    if (this.continueColor !== undefined) {
      message = message.replace(/^/, this.continueColor);
      this.continueColor = true;
    }
    if (!flags.includes('w')) {
      if (colorElems !== null && colorElems[colorElems.length - 1] !== white) {
        message += white;
        if (flags.includes('n')) this.continueColor = colorElems[colorElems.length - 1];
      }
    }
    // must be true so the first time it's set, it isn't affected.
    if (this.continueColor == true) {
      message += white;
      this.continueColor = undefined;
    }

    if (flags.includes('l')) {
      this.locked = false;
      if (!flags.includes('n')) /* this.send("> "); */ message += "> ";
    }

    // break message into line-sized pieces
    // remove any zero-width spaces already in the string (can't really imagine why there would be one in the first place but still)
    message = message.replace("​", "");
    // that was a very long comment
    // ok so i actually need to code this now
    // ...
    // [inhale]
    // ...
    // [exhale]
    // ok
    // i think i'm ready
    // let's do this
    // replace all HTML elements with zero-width spaces
    if (colorElems !== null) message = message.replace(/<[^<>]*>/g, "​") // WARNING!! there is a zero-width space in that string (if using vscode, install gremlins ext.)

    var broken = message.split('\n');
    var i = 0;
    while (i < broken.length) {
      var line = broken[i];
      var excess = line.length - visibleLength(line);
      if (line.length > 81 + excess) {
        var index = line.lastIndexOf(" ", 81);
        if (index < 0) {
          index = 80 + excess;
          broken[i] = broken[i].substring(0, index) + '\n' + broken[i].substring(index);
        } else {
          broken[i] = broken[i].substring(0, index) + '\n' + broken[i].substring(index + 1);
        }
        // Split the array again to prevent extra-long lines
        broken = broken.join('\n').split('\n');
        i = 0; // Restart the loop
      } else {
        i++; // Move to the next line if no break is needed
      }
    }

    message = broken.join('\n');
    // put HTML back in
    if (colorElems !== null) {
      for (var elem of colorElems) {
        message = message.replace("​", elem);
      }
    }

    this.send(message);
  }, delay);
};


process.removeFromArray = function(array, item) {
  var index = array.indexOf(item);
  if (index > -1) array.splice(index, 1);
}

process.sendRoomData = function(user, flags, callback) {
  if (callback !== undefined) callback = null;
  
  var room = process.getRoom(user);

  if (/[a-zA-Z]$/.test(room.name)) {
    user.connection.sendmsg(`\n${red}${room.name}:${white}`);
  } else {
    user.connection.sendmsg(`\n${red}${room.name}${white}`);
  }
  
  user.connection.sendmsg(`${room.description}\n`);
  user.connection.sendmsg(`${red}Exits:`);
  if (room.exits.north !== undefined) user.connection.sendmsg(room.exits.north.description);
  if (room.exits.east !== undefined) user.connection.sendmsg(room.exits.east.description);
  if (room.exits.south !== undefined) user.connection.sendmsg(room.exits.south.description);
  if (room.exits.west !== undefined) user.connection.sendmsg(room.exits.west.description);

  user.connection.sendmsg('', callback, flags);

  return true;
}

process.getRoom = function(user) {
  if (process.rooms[user.room[0]] !== undefined && process.rooms[user.room[0]][user.room[1]] !== undefined && process.rooms[user.room[0]][user.room[1]][user.room[2]] !== undefined) {
    var room = process.rooms[user.room[0]][user.room[1]][user.room[2]];
    if (!room.unfinished) return room;
  }
  return process.rooms[0][0][0]; // out of bounds
}

process.capitalizeFirst = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
