'use strict';
const i = require('fs').readFileSync('22.in', 'utf8');
let r = 'Days ';
switch (i) {
  case '22':
    r = r + 'Monday';
    break;
  case '23':
    r = r + 'Tuesday';
    break;
  case '24':
    r = r + 'Wednesday';
    break;
  case '25':
    r = r;
    break;
}
console.log(r);
