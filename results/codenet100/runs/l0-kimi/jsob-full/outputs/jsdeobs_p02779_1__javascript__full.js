'use strict';
const fs = require('fs');

function Main(input) {
    const lines = input.trim().split('\n');
    const n = Number(lines[0].trim());
    const arr = lines[1].trim().split(' ').map(Number);
    
    let result = 'YES';
    for (let i = 0; i < n; i++) {
        let count = arr.filter(x => x === arr[i]).length;
        let occurrences = arr.indexOf(arr[i]);
        if (occurrences !== -1) {
            result = 'NO';
            break;
        }
    }
    console.log(result);
}

Main(fs.readFileSync('input.txt', 'utf8'));
