const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = input.replace(/\n$/, '').split('\n');

const testCases = Number(lines.shift());

for (let testCase = 0; testCase < testCases; testCase++) {
    const rectangle = lines.shift().split(' ').map(Number);

    const x1 = rectangle[0];
    const y1 = rectangle[1];
    const x2 = x1 + rectangle[2];
    const y2 = y1 + rectangle[3];

    const pointCount = Number(lines.shift());
    let count = 0;

    for (let i = 0; i < pointCount; i++) {
        const point = lines.shift().split(' ').map(Number);
        const x = point[0];
        const y = point[1];

        if (x1 <= x && x <= x2 && y1 <= y && y <= y2) {
            count++;
        }
    }

    console.log(count);
}
