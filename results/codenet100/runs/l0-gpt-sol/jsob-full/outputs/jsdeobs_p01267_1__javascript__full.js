const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8')
  .replace(/\n$/, '')
  .split('\n');

while (true) {
  const [count, multiplier, increment, modulus, seed] = lines
    .shift()
    .split(' ')
    .map(Number);

  if ([count, multiplier, increment, modulus, seed].join('') == '00000') {
    break;
  }

  const targets = lines.shift().split(' ').map(Number);

  let current = seed;
  let iterations = 0;

  while (true) {
    if (targets[0] == current) {
      targets.shift();
    }

    if (targets.length == 0) {
      console.log(iterations);
      break;
    }

    current = (multiplier * current + increment) % modulus;
    iterations++;

    if (iterations == 10001) {
      console.log(-1);
      break;
    }
  }
}
