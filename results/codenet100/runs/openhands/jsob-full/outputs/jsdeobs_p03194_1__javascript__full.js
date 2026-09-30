const fs = require('fs');

function main(input) {
  const [requiredMultiplicityText, valueText] = input.split(' ');
  const requiredMultiplicity = parseInt(requiredMultiplicityText, 10);
  let remainingValue = parseInt(valueText, 10);

  const primeFactors = [];
  for (let candidate = 2; candidate <= remainingValue; candidate += 1) {
    while (remainingValue % candidate === 0) {
      primeFactors.push(candidate);
      remainingValue = Math.floor(remainingValue / candidate);
    }
  }

  const factorCounts = [];
  for (const factor of primeFactors) {
    factorCounts[factor] = factorCounts[factor] ? factorCounts[factor] + 1 : 1;
  }

  const uniqueFactors = primeFactors.filter(
    (factor, index, factors) => factors.indexOf(factor) === index,
  );

  let result = 1;
  for (const factor of uniqueFactors) {
    if (factorCounts[factor] >= requiredMultiplicity) {
      result *= factor;
    }
  }

  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
