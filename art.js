const fs = require('fs');

process.art = {};

fs.readdirSync("./art").forEach(file => {
  process.art[file] = fs.readFileSync("./art/" + file, { encoding: 'utf8', flag: 'r' });
});