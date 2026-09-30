const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.replace(/\n$/, '').split('\n');

while (true) {
  const parameters = lines.shift().split(' ').map(Number);

  if (parameters.join('') === '00000') {
    break;
  }

  const targets = lines.shift().split(' ').map(Number);
  const [, increment, multiplier, modulus, initialValue] = parameters;

  let currentValue = initialValue;
  let stepCount = 0;

  while (true) {
    if (targets[0] === currentValue) {
      targets.shift();
    }

    if (targets.length === 0) {
      console.log(stepCount);
      break;
    }

    currentValue = ((increment + currentValue) * multiplier) % modulus;
    stepCount++;

    if (stepCount === 10001) {
      console.log(-1);
      break;
    }
  }
}
