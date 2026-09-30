function main(input) {
  const values = input.split(' ');
  const minimumExponent = parseInt(values[0], 10);
  let remaining = parseInt(values[1], 10);
  const primeExponents = new Map();

  for (let candidate = 2; candidate <= remaining; candidate++) {
    while (remaining % candidate === 0) {
      primeExponents.set(candidate, (primeExponents.get(candidate) || 0) + 1);
      remaining = Math.floor(remaining / candidate);
    }
  }

  let result = 1;
  for (const [prime, exponent] of primeExponents) {
    if (exponent >= minimumExponent) {
      result *= prime;
    }
  }

  console.log(result);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
