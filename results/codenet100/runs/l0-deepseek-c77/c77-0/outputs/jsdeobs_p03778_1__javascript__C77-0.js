'use strict';

const main = (input) => {
  const values = input.split(' ').map((part) => parseInt(part));
  const a = values[0];
  const b = values[1];
  const c = values[2];
  const ab = b + a;
  const ac = c + a;
  let ordered = [];

  if (b <= c) {
    ordered = [b, ab, c, ac];
  } else {
    ordered = [c, ac, b, ab];
  }

  if (ordered[1] < ordered[2]) {
    console.log(ordered[2] - ordered[1]);
  } else {
    console.log(0);
  }
};

main(require('fs').readFileSync('/dev/stdin', 'utf-8'));
