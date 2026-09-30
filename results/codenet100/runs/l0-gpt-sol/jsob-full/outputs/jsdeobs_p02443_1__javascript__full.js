const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const n = lines.shift() - 0;
let array = lines.shift().split(' ').map(Number);
const queryCount = lines.shift() - 0;

for (let i = 0; i < queryCount; i++) {
    const [begin, end] = lines[i].split(' ').map(Number);

    const prefix = array.slice(0, begin);
    const reversed = array.slice(begin, end).reverse();
    const suffix = array.slice(end);

    array = prefix.concat(reversed, suffix);
}

console.log(array.join(' '));
