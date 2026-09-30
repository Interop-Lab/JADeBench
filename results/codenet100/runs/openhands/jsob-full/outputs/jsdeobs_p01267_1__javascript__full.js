const { readFileSync } = require('fs');

const MAX_ITERATIONS = 10_000;

function findLastTargetIteration(targets, multiplier, increment, modulus, initialValue) {
  let currentValue = initialValue;
  let iteration = 0;

  while (true) {
    if (targets[0] === currentValue) {
      targets.shift();
    }

    if (targets.length === 0) {
      return iteration;
    }

    currentValue = (multiplier * currentValue + increment) % modulus;
    iteration++;

    if (iteration > MAX_ITERATIONS) {
      return -1;
    }
  }
}

const lines = readFileSync('/dev/stdin', 'utf8').replace(/\n$/, '').split('\n');

while (true) {
  const parameters = lines.shift().split(' ').map(Number);
  if (parameters.join('') === '00000') {
    break;
  }

  const targets = lines.shift().split(' ').map(Number);
  const [, multiplier, increment, modulus, initialValue] = parameters;
  console.log(
    findLastTargetIteration(targets, multiplier, increment, modulus, initialValue),
  );
}
