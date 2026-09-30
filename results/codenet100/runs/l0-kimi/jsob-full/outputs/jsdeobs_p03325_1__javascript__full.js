'use strict';
const fs = require('fs');

function main(input) {
    const numbers = input.split('\n')[1].split(' ').map(x => Number(x));
    let count = 0;
    for (let num of numbers) {
        while (num % 2 === 0) {
            num = num / 2;
            count++;
        }
    }
    console.log(count);
}

main(fs.readFileSync('stdin', 'utf-8'));
