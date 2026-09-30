function Main(input) {
  const [minimumExponentText, numberText] = input.split(' ');
  const minimumExponent = parseInt(minimumExponentText, 10);
  let remainingNumber = parseInt(numberText, 10);

  const primeFactors = [];
  let divisor = 2;

  while (divisor <= remainingNumber) {
    while (remainingNumber % divisor === 0) {
      primeFactors.push(divisor);
      remainingNumber = Math.floor(remainingNumber / divisor);
    }
    divisor++;
  }

  const factorCounts = [];
  for (const primeFactor of primeFactors) {
    factorCounts[primeFactor] = factorCounts[primeFactor]
      ? factorCounts[primeFactor] + 1
      : 1;
  }

  const uniquePrimeFactors = primeFactors.filter(
    (primeFactor, index, factors) => factors.indexOf(primeFactor) === index,
  );

  let result = 1;
  for (const primeFactor of uniquePrimeFactors) {
    if (factorCounts[primeFactor] >= minimumExponent) {
      result *= primeFactor;
    }
  }

  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
