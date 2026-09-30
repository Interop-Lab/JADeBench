'use strict';
const fs = require('fs');

const main = (input) => {
    input = input.trim().split('\n');
    const a = parseInt(input[0].split(' ')[0]);
    const b = parseInt(input[1].split(' ')[0]);
    console.log(b === 0 ? -1 : a - b);
};

main(fs.readFileSync('stdin', 'utf8'));
