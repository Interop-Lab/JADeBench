const fs = require('fs');

function main(input) {
  const values = input
    .split('\n')[0]
    .split(' ')
    .map((value) => parseInt(value, 10))
    .sort((left, right) => right - left);

  let moves = 0;

  if ((values[1] - values[2]) % 2 === 0) {
    moves += values[0] - values[1];
    values[2] += moves;
    moves += (values[0] - values[2]) / 2;
  } else {
    values[0]++;
    values[1]++;
    moves++;

    moves += values[0] - values[1];
    values[2] += values[0] - values[1];
    moves += (values[0] - values[2]) / 2;
  }

  console.log(moves);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
