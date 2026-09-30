const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

while (true) {
    const [columnCount, rowCount] = lines.shift().split(' ').map(Number);

    if (columnCount === 0 && rowCount === 0) {
        break;
    }

    let columnSums = Array(columnCount).fill(0);

    for (let row = 0; row < rowCount; row++) {
        const values = lines.shift().split(' ').map(Number);
        columnSums = values.map((value, column) => columnSums[column] + value);
    }

    console.log(Math.max(...columnSums));
}
