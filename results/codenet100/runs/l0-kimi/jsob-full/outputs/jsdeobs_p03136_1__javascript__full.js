'use strict';
const fs = require('fs');

const main = (input) => {
    const lines = input.trim().split('\n');
    const n = parseInt(lines[0].split(' ')[0]);
    let arr = lines[1].split(' ').map(x => parseInt(x)).sort((a, b) => b - a);
    const maxVal = arr[0];
    const sumVal = arr.reduce((a, b) => a + b);
    console.log(maxVal > sumVal ? 'Yes' : 'No');
};

main(fs.readFileSync('stdin', 'utf-8'));
