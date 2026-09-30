const fs = require('fs');

function calculateMoves(input) {
  const piles = input
    .split('\n')[0]
    .split(' ')
    .map((value) => parseInt(value, 10))
    .sort((left, right) => right - left);

  let moves = 0;

  if ((piles[1] - piles[2]) % 2 === 0) {
    moves += piles[0] - piles[1];
    piles[2] += moves;
    moves += (piles[0] - piles[2]) / 2;
  } else {
    piles[0]++;
    piles[1]++;
    moves++;

    moves += piles[0] - piles[1];
    piles[2] += piles[0] - piles[1];
    moves += (piles[0] - piles[2]) / 2;
  }

  console.log(moves);
}

calculateMoves(fs.readFileSync('/dev/stdin', 'utf8'));
