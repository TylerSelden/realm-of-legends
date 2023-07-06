const fs = require('fs');

var art = {};

fs.readdirSync("./art").forEach(file => {
  art[file] = fs.readFileSync("./art/" + file, { encoding: 'utf8', flag: 'r' });
});

module.exports = art;