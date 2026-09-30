'use strict';

const fs = require('fs');

const day = fs.readFileSync('/dev/stdin', 'utf8');
let greeting = 'Christmas ';

switch (day) {
  case '22':
    greeting += 'Eve Eve Eve';
    break;
  case '23':
    greeting += 'Eve Eve';
    break;
  case '24':
    greeting += 'Eve';
    break;
}

console.log(greeting);
