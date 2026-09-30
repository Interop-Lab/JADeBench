const MODULUS = 10 ** 9 + 7;

function main(input) {
  const [upperBound, start] = input.trim().split(' ').map(Number);
  let total = 0;

  for (let current = start; current <= upperBound + 1; current += 1) {
    const precedingSum = ((current - 1) * current) / 2;
    const remainingCount = upperBound - current + 1;
    const upperRangeSum = ((remainingCount + upperBound) * current) / 2;

    total += upperRangeSum - precedingSum + 1;
  }

  return console.log(((total % MODULUS) + MODULUS) % MODULUS);
}

if (process.env.MYTEST) {
  if (process.env.MYTEST === 'test') {
    test();
  } else {
    main(require('fs').readFileSync('dev/stdin', 'utf8'));
  }
} else {
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
