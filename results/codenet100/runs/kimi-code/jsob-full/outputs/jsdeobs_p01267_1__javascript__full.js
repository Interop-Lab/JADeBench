const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').replace(/\n$/, '').split('\n');

while (true) {
  const parameters = lines.shift().split(' ').map(Number);
  if (parameters.join('') === '00000') break;

  const targets = lines.shift().split(' ').map(Number);
  const [, multiplier, increment, modulus, initialValue] = parameters;
  let value = initialValue;
  let iterations = 0;

  while (true) {
    if (targets[0] === value) targets.shift();

    if (targets.length === 0) {
      console.log(iterations);
      break;
    }

    value = (multiplier * value + increment) % modulus;
    iterations++;

    if (iterations === 10001) {
      console.log(-1);
      break;
    }
  }
}
