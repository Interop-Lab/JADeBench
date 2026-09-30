const MODULUS = 1_000_000_007;

const main = (input) => {
  const [upperBound, start] = input.trim().split(' ').map(Number);
  let total = 0;

  for (let current = start; current <= upperBound + 1; current += 1) {
    const lowerRangeSum = ((current - 1) * current) / 2;
    const upperRangeStart = upperBound - current + 1;
    const upperRangeSum = ((upperRangeStart + upperBound) * current) / 2;

    total += upperRangeSum - lowerRangeSum + 1;
  }

  console.log(((total % MODULUS) + MODULUS) % MODULUS);
};

if (process.env.MYTEST) {
  if (process.env.MYTEST === 'test') {
    test();
  } else {
    main(require('fs').readFileSync('dev/stdin', 'utf8'));
  }
} else {
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
