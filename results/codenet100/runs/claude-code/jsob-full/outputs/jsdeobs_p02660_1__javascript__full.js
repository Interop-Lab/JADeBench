const fs = require('fs');

function countDivisions(input) {
  const number = parseInt(input.split('\n')[0]);
  let divisionCount = 0;
  let remaining = number;

  for (let base = 2; base < Math.sqrt(number); base++) {
    let power = base;

    for (let exponent = 1; power < number; exponent++) {
      const divisor = Math.pow(base, exponent);
      if (remaining % divisor !== 0) {
        break;
      }

      divisionCount++;
      remaining /= divisor;
      power = Math.pow(base, exponent + 1);
    }
  }

  if (divisionCount === 0 && number !== 1) {
    divisionCount = 1;
  }

  console.log('%s', divisionCount);
  return divisionCount;
}

countDivisions(fs.readFileSync('/dev/stdin', 'utf8'));
