const fs = require('fs');

function Main(input) {
  const lines = input.split('\n');
  const number = parseInt(lines[0]);

  let factorCount = 0;
  let remaining = number;

  for (let base = 2; base < Math.sqrt(number); base++) {
    let power = base;

    for (let exponent = 1; power < number; exponent++) {
      const divisor = Math.pow(base, exponent);

      if (remaining % divisor !== 0) {
        break;
      }

      factorCount++;
      remaining /= divisor;
      power = Math.pow(base, exponent + 1);
    }
  }

  if (factorCount === 0 && number !== 1) {
    factorCount = 1;
  }

  console.log('%s', factorCount);
  return factorCount;
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
