process.sendmsg = function(message, callback, flags) {
  if (flags == undefined) flags = "";
  /*
    flags:
    n: NO newline after message
    l: unlock account
    d3000: delay 3000 ms
    v: validate connection
    i: hide input symbol
  */
  var delay = 0;
  if (flags.includes('d')) delay = parseInt(flags.match(/d(\d+)/)[1]);
  if (flags.includes('v')) this.validated = true;

  if (typeof(callback) == "function") this.callback = callback;

  setTimeout(() => {
    // this.send(message);
    if (!flags.includes('n')) {
      // this.send(`\n`);
      message += '\n';
    }
    if (flags.includes('l')) {
      this.locked = false;
      if (!flags.includes('n')) /* this.send("> "); */ message += "> ";
    }

    //break message into line-sized pieces
    var broken = message.split('\n');
    for (var i = 0; i < broken.length; i++) {
      if (broken[i].length > 81) {
        var index = broken[i].lastIndexOf(" ", 81);
        broken[i] = broken[i].substring(0, index) + '\n' + broken[i].substring(index + 1);
    
        // Split the array again to prevent extra-long lines
        broken = broken.join('\n').split('\n');
        i = 0; // Restart the loop
      }
    }
    
    
    message = broken.join('\n');
    this.send(message);
  }, delay);
}