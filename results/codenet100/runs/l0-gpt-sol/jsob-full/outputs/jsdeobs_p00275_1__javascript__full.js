const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
    const N = lines.shift() - 0;
    if (N == 0) break;

    const counts = new Array(N).fill(0);
    let pending = 0;
    const commands = lines.shift();

    for (let i = 0; i < commands.length; i++) {
        const index = i % N;
        const command = commands[i];

        if (command === 'M') {
            counts[index]++;
        }

        if (command === 'L') {
            counts[index] += pending + 1;
            pending = 0;
        }

        if (command === 'S') {
            pending += counts[index] + 1;
            counts[index] = 0;
        }
    }

    counts.sort((a, b) => a - b);
    console.log(counts.join(' ') + ' ' + pending);
}
