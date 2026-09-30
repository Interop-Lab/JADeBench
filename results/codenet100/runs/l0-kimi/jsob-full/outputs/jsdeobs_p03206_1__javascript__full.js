'use strict';
const fs = require('fs');
const input = fs.readFileSync('stdin', 'utf8');
let result = 'Node.js ';
switch(input) {
    case '22':
        result = result + 'v22 LTS';
        break;
    case '23':
        result = result + 'v23';
        break;
    case '24':
        result = result + 'v24 LTS';
        break;
    case '25':
        result = result;
        break;
}
console.log(result);
