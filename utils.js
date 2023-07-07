function sendmsg(message, callback, flags) {
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
    this.send(message);
    if (!flags.includes('n')) {
      this.send(`\n`);
    }
    if (flags.includes('l')) {
      this.locked = false;
      if (!flags.includes('n')) this.send("> ");
    }
  }, delay);
}

module.exports = { sendmsg }