const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const n = Number(lines.shift());
const values = lines.shift().split(' ').map(Number);
const queryCount = Number(lines.shift());

for (let i = 0; i < queryCount; i++) {
    const [start, end, target] = lines[i].split(' ').map(Number);
    const length = end - start;

    for (let j = 0; j < length; j++) {
        [values[start + j], values[target + j]] = [
            values[target + j],
            values[start + j]
        ];
    }
}

console.log(values.join(' '));
