const fs = require('fs');

function main(input) {
  const values = input.split(' ');
  const minimumExponent = parseInt(values[0], 10);
  let remaining = parseInt(values[1], 10);

  const primeFactors = [];
  let divisor = 2;
  while (divisor <= remaining) {
    while (remaining % divisor === 0) {
      primeFactors.push(divisor);
      remaining = Math.floor(remaining / divisor);
    }
    divisor++;
  }

  const factorCounts = [];
  for (const factor of primeFactors) {
    factorCounts[factor] = factorCounts[factor]
      ? factorCounts[factor] + 1
      : 1;
  }

  const distinctFactors = primeFactors.filter(
    (factor, index, factors) => factors.indexOf(factor) === index,
  );

  let result = 1;
  for (const factor of distinctFactors) {
    if (factorCounts[factor] >= minimumExponent) {
      result *= factor;
    }
  }

  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
