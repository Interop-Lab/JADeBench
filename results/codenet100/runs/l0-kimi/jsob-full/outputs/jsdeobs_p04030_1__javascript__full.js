'use strict';
const fs = require('fs');

function Main(input) {
    const lines = input.split('\n');
    const firstLine = lines[0].split('');
    const result = [];
    
    for (const char of firstLine) {
        if (char === 'B') {
            result.pop();
        } else {
            result.push(char);
        }
    }
    
    console.log(result.join(''));
}

Main(fs.readFileSync('stdin', 'utf8'));
