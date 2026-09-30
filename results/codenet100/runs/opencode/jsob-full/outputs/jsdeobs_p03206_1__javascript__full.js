'use strict';

const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
let message = 'Christmas ';

switch (input) {
  case '22':
    message += 'Eve Eve Eve';
    break;
  case '23':
    message += 'Eve Eve';
    break;
  case '24':
    message += 'Eve';
    break;
  case '25':
    break;
}

console.log(message);
