'use strict';
const fs = require('fs');

const main = (input) => {
    input = input.trim().split('\n');
    const n = parseInt(input[0]);
    const arr = input[1].split(' ').map(x => parseInt(2 * x));
    
    let sum = 0;
    for (let i = 0; i < n; i++) {
        sum += arr[i];
    }
    
    let avg = sum / (2 * n);
    let current = avg;
    const result = [];
    
    for (let i = 0; i < n; i++) {
        result.push(current);
        current = arr[i] - current;
    }
    
    console.log(result.join(' '));
};

main(fs.readFileSync('stdin', 'utf8'));
