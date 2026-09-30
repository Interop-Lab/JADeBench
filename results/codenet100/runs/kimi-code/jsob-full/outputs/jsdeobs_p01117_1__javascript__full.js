const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const [columnCount, rowCount] = lines.shift().split(' ').map(Number);

  if (columnCount === 0 && rowCount === 0) {
    break;
  }

  const columnTotals = Array(columnCount).fill(0);

  for (let row = 0; row < rowCount; row++) {
    const values = lines.shift().split(' ').map(Number);
    values.forEach((value, column) => {
      columnTotals[column] += value;
    });
  }

  console.log(Math.max(...columnTotals));
}
