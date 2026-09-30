const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.replace(/\n$/, '').split('\n');
const count = lines.shift();

for (let i = 0; i < count; i++) {
    const line = lines[i];

    if (/^>'(=+)#\1~$/.test(line)) {
        console.log('A');
    } else if (/^>\^(Q=)+~~$/.test(line)) {
        console.log('B');
    } else {
        console.log('NA');
    }
}
