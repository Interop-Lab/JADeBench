function Main(input) {
  const parts = input.split(' ');
  const n = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const factors = [];
  const counts = [];
  let result = 1;
  let divisor = 2;
  while (divisor <= m) {
    while (m % divisor === 0) {
      factors.push(divisor);
      m = Math.floor(m / divisor);
    }
    divisor++;
  }
  for (let i = 0; i < factors.length; i++) {
    const factor = factors[i];
    counts[factor] = counts[factor] ? counts[factor] + 1 : 1;
  }
  const uniqueFactors = factors.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
  for (let i = 0; i < uniqueFactors.length; i++) {
    if (counts[uniqueFactors[i]] >= n) {
      result *= uniqueFactors[i];
    }
  }
  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
