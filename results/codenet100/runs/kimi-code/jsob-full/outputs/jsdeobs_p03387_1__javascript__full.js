const fs = require('fs');

function calculateScore(input) {
  const values = input
    .split('\n')[0]
    .split(' ')
    .map((value) => parseInt(value, 10))
    .sort((left, right) => right - left);

  let [largest, middle, smallest] = values;
  let score = 0;

  if ((middle - smallest - 2) % 2 === 0) {
    score += largest - middle;
    smallest += score;
    score += (largest - smallest) / 2;
  } else {
    largest++;
    middle++;
    score++;
    score += largest - middle;
    smallest += largest - middle;
    score += (largest - smallest) / 2;
  }

  return score;
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
console.log(calculateScore(input));
