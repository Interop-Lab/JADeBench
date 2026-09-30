const fs = require('fs');

function countInteriorCells(input) {
  const [rows, columns] = input.split(' ').map((value) => parseInt(value));

  let count;
  if (rows === 1 && columns === 1) {
    count = 1;
  } else if (rows === 1 || columns === 1) {
    count = rows + columns - 3;
  } else {
    count = (rows - 2) * (columns - 2);
  }

  if (count > 9_000_000_000_000_000) {
    const innerRows = rows - 2;
    const innerColumns = columns - 2;
    const highProduct = Math.floor(innerRows / 10_000) * innerColumns;
    const lowProduct = (innerRows % 10_000) * innerColumns;

    count =
      highProduct +
      Math.floor(lowProduct / 10_000) +
      String(`0000${lowProduct % 10_000}`).slice(-4);
  }

  console.log(count);
}

countInteriorCells(fs.readFileSync('/dev/stdin', 'utf8'));
