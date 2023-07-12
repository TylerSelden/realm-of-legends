const fs = require('fs');

art = {};

fs.readdirSync("./art").forEach(file => {
  art[file] = fs.readFileSync("./art/" + file, { encoding: 'utf8', flag: 'r' });
});

module.exports = art;