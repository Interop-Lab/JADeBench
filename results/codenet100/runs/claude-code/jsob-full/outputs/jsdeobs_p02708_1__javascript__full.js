const fs = require('fs');

const MODULUS = 1_000_000_007;

const main = input => {
  const [upperBound, start] = input.trim().split(' ').map(Number);
  let total = 0;

  for (let current = start; current <= upperBound + 1; current++) {
    const precedingPairCount = ((current - 1) * current) / 2;
    const remainingCount = upperBound - current + 1;
    const rangeContribution = ((remainingCount + upperBound) * current) / 2;

    total += rangeContribution - precedingPairCount + 1;
  }

  return console.log(((total % MODULUS) + MODULUS) % MODULUS);
};

if (process.env.MYTEST) {
  if (process.env.MYTEST === 'test') {
    test();
  } else {
    main(fs.readFileSync('dev/stdin', 'utf8'));
  }
} else {
  main(fs.readFileSync('/dev/stdin', 'utf8'));
}
