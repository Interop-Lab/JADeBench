function calculateResult(input) {
  const number = parseInt(input.split('\n')[0]);
  let factorCount = 0;
  let remainder = number;

  for (let factor = 2; factor < Math.sqrt(number); factor += 1) {
    let exponent = 1;
    let factorPower = factor;

    while (factorPower < number) {
      if (remainder % factorPower !== 0) {
        break;
      }

      factorCount += 1;
      remainder /= factorPower;
      exponent += 1;
      factorPower = Math.pow(factor, exponent);
    }
  }

  if (factorCount === 0 && number !== 1) {
    factorCount = 1;
  }

  console.log('%s', factorCount);
  return factorCount;
}

calculateResult(require('fs').readFileSync('/dev/stdin', 'utf8'));
