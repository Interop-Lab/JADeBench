'use strict';
const fs = require('fs');

const main = (input) => {
    const lines = input.trim().split('\n');
    const n = parseInt(lines[0]);
    const grid = [];
    
    for (let i = 0; i < 10; i++) {
        grid.push(new Array(10).fill(0));
    }
    
    for (let i = 0; i < n; i++) {
        const s = String(i);
        const tens = parseInt(s[0]);
        const ones = parseInt(s[s.length - 1]);
        grid[tens][ones]++;
    }
    
    let result = 0;
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            result += grid[i][j] * grid[j][i];
        }
    }
    
    console.log(result);
};

main(fs.readFileSync('stdin', 'utf8'));
