function decodePattern(encodedPattern) {
  let blockSize = 1;

  while ((encodedPattern & 3) === 0) {
    blockSize += 1;
    encodedPattern >>>= 2;
  }

  return {
    blockSize,
    isCheckerboard: Boolean(encodedPattern & 1),
  };
}

function selectsCell(pattern, row, column) {
  const blockRow = Math.floor(row / pattern.blockSize);

  if (!pattern.isCheckerboard) {
    return !(blockRow & 1);
  }

  const blockColumn = Math.floor(column / pattern.blockSize);
  return !((blockRow + blockColumn) & 1);
}

function main(input) {
  const [size, firstEncoding, secondEncoding] = input
    .split(' ')
    .map(value => +value);
  const patterns = [decodePattern(firstEncoding), decodePattern(secondEncoding)];
  const gridSize = 2 * size;
  const requiredCount = size * size;
  const coordinates = [];

  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      if (patterns.every(pattern => selectsCell(pattern, row, column))) {
        coordinates.push(row + ' ' + column);
      }

      if (coordinates.length === requiredCount) {
        console.log(coordinates.join('\n'));
        return;
      }
    }
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
