const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
const lines = input.split('\n');

while (lines.length > 0) {
    const degrees = [];
    let line;

    while ((line = lines.shift()) != '0 0') {
        const numbers = line.split(' ');
        const from = +numbers[0];
        const to = +numbers[1];

        degrees[from] = (degrees[from] || 0) + 1;
        degrees[to] = (degrees[to] || 0) + 1;
    }

    const oddDegrees = degrees.filter(degree => degree % 2 == 1);

    if (degrees[1] % 2 == 1 && degrees[2] % 2 == 1 && oddDegrees.length > 2) {
        console.log('NG');
    } else {
        console.log('OK');
    }
}
