const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const columnCount = lines.shift() - 0;
  if (columnCount == 0) break;

  const columnValues = Array(columnCount).fill(0);
  let carriedValue = 0;
  const commands = lines.shift();

  for (let index = 0; index < commands.length; index++) {
    const command = commands[index];
    const column = index % columnCount;

    if (command === 'M') {
      columnValues[column]++;
    }

    if (command === 'L') {
      columnValues[column] += carriedValue + 1;
      carriedValue = 0;
    }

    if (command === 'S') {
      carriedValue += columnValues[column] + 1;
      columnValues[column] = 0;
    }
  }

  columnValues.sort((left, right) => left - right);
  console.log(`${columnValues.join(' ')} ${carriedValue}`);
}
