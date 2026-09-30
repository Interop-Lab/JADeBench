const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const [columnCount, rowCount] = lines.shift().split(' ').map(Number);

  if (columnCount === 0 && rowCount === 0) {
    break;
  }

  let columnTotals = [];
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    columnTotals[columnIndex] = 0;
  }

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = lines.shift().split(' ').map(Number);
    columnTotals = row.map(
      (value, columnIndex) => columnTotals[columnIndex] + value,
    );
  }

  console.log(Math.max(...columnTotals));
}
