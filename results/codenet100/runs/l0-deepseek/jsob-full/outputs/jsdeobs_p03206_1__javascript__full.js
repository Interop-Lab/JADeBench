const fs = require('fs');
const i = fs.readFileSync('in', 'utf8');
let r = 's ';
switch (i) {
  case '22':
    r = r + 'a';
    break;
  case '23':
    r = r + 'b';
    break;
  case '24':
    r = r + 'c';
    break;
  case '25':
    r = r;
    break;
}
console.log(r);
