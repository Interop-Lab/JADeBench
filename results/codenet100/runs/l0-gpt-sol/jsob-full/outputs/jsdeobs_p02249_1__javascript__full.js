const fs = require('fs');

const config = {
  input: '/dev/stdin',
  newline: '\n'
};

const lines = fs.readFileSync(config.input, 'utf8').split(config.newline);
const [H, W] = lines[0].split(' ').map(Number);
const field = lines.slice(1, H + 1);
const [R, C] = lines[H + 1].split(' ').map(Number);
const pattern = lines.slice(H + 2, H + 2 + R);

const matches = new Array(H);

for (let row = 0; row < H; row++) {
  matches[row] = new Array(R);

  for (let patternRow = 0; patternRow < R; patternRow++) {
    matches[row][patternRow] = {};

    let column = field[row].indexOf(pattern[patternRow]);
    while (column !== -1) {
      matches[row][patternRow][column] = true;
      column = field[row].indexOf(pattern[patternRow], column + 1);
    }
  }
}

for (let row = 0; row <= H - R; row++) {
  for (let column = 0; column <= W - C; column++) {
    let found = true;

    for (let patternRow = 0; patternRow < R; patternRow++) {
      if (!matches[row + patternRow][patternRow].hasOwnProperty(column)) {
        found = false;
        break;
      }
    }

    if (found) {
      console.log('%d %d', row, column);
    }
  }
}
