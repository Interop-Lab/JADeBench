'use strict';
const fs = require('fs');

function getPair(n) {
    const binary = n.toString(2);
    const flipped = binary.split('').map(bit => bit === '1' ? '0' : '1').join('');
    return parseInt(flipped, 2);
}

function main(input) {
    const lines = input.split('\n').filter(line => line !== '');
    const nums = lines[0].split(' ').map(Number);
    let arr = nums.slice().sort((a, b) => b - a);
    let count = 0;
    
    while (arr.length >= 2) {
        let first = arr[0];
        arr.splice(0, 1);
        let pair = getPair(first);
        let idx = arr.indexOf(pair);
        
        if (idx >= 0) {
            arr.splice(idx, 1);
            count++;
        }
    }
    
    console.log(count);
}

main(fs.readFileSync('stdin', 'utf-8'));
