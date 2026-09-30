'use strict';
const i = require('fs')['readFileSync'](0, 'utf8');
let r = 's ';
switch (i) {
  case '22':
    r = r + 't';
    break;
  case '23':
    r = r + 't';
    break;
  case '24':
    r = r + 't';
    break;
  case '25':
    r = r;
    break;
}
console['log'](r);
