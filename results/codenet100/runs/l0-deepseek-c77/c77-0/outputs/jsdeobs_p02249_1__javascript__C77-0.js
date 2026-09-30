const fs = require('fs');

const config = {
  input: '/dev/stdin',
  newline: '\n'
};

const line = fs.readFileSync(config.input, 'ascii').split(config.newline);

line[0] = line[0].split(' ').map(Number);
const H = line[0][0];
const W = line[0][1];

const field = line.slice(1, 1 + H);

line[1 + H] = line[1 + H].split(' ').map(Number);
const R = line[1 + H][0];
const C = line[1 + H][1];

const pat = line.slice(1 + H + 1, 1 + H + 1 + R);

const mem = new Array(H);
for (let i = 0; i < H; i++) {
  mem[i] = new Array(R);
  for (let j = 0; j < R; j++) {
    mem[i][j] = {};
    let k = field[i].indexOf(pat[j]);
    while (k !== -1) {
      mem[i][j][k] = true;
      k = field[i].indexOf(pat[j], k + 1);
    }
  }
}

for (let i = 0; i <= H - R; i++) {
  for (let j = 0; j <= W - C; j++) {
    let flag = true;
    for (let k = 0; k < R; k++) {
      if (!mem[i + k][k].hasOwnProperty(j)) {
        flag = false;
        break;
      }
    }
    if (flag) {
      console.log('%d %d', i, j);
    }
  }
}
