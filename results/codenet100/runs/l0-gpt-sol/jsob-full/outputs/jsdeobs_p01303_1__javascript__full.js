const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.replace(/\n$/, '').split('\n');
const testCaseCount = lines.shift() - 0;

for (let testCase = 0; testCase < testCaseCount; testCase++) {
    const [x, y, width, height] = lines.shift().split(' ').map(Number);
    const x2 = x + width;
    const y2 = y + height;

    const pointCount = lines.shift() - 0;
    let count = 0;

    for (let i = 0; i < pointCount; i++) {
        const [pointX, pointY] = lines.shift().split(' ').map(Number);

        if (
            x <= pointX &&
            pointX <= x2 &&
            y <= pointY &&
            pointY <= y2
        ) {
            count++;
        }
    }

    console.log(count);
}
