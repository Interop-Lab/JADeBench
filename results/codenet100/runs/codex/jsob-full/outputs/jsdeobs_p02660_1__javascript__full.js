const fs = require('fs');

function Main(input) {
  const [firstLine] = input.split('\n');
  const number = parseInt(firstLine);

  let factorCount = 0;
  let remaining = number;

  for (let base = 2; base < Math.sqrt(number); base++) {
    let power = base;

    for (let exponent = 1; power < number; exponent++) {
      if (remaining % Math.pow(base, exponent) !== 0) {
        break;
      }

      factorCount++;
      remaining /= Math.pow(base, exponent);
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
