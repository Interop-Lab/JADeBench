'use strict';
const fs = require('fs');

function main(input) {
    const numbers = input.toString().trim().split('\n')[0].split(' ').map(Number);
    const length = numbers.length;
    let count = 0;
    
    for (let i = 0; i < length; i++) {
        if ((i + 1) % 3 === 0) continue;
        if (numbers[i] % 2 === 0) continue;
        count++;
    }
    
    console.log(count);
}

main(fs.readFileSync('stdin', 'utf8'));
