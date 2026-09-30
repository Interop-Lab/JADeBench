const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const n = Number(lines.shift());
let numbers = lines.shift().split(' ').map(Number);
const queryCount = Number(lines.shift());

for (let i = 0; i < queryCount; i++) {
    const [start, end] = lines[i].split(' ').map(Number);

    numbers = numbers
        .slice(0, start)
        .concat(numbers.slice(start, end).reverse(), numbers.slice(end));
}

console.log(numbers.join(' '));
