'use strict';

const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const values = input.split(/ |\n/).slice(0, 7).map(Number);

const a = values[0];
const d = values[3];
const e = values[4];

let result =
  a +
  2 * (
    (a / 2 | 0) +
    (d / 2 | 0) +
    (e / 2 | 0)
  );

switch ((a / 2 + d / 2 + e / 2) | 0) {
  case 3:
    result += 3;
    break;
  case 2:
    if ((a + d) % e) {
      result += 1;
    }
    break;
}

console.log(result);
