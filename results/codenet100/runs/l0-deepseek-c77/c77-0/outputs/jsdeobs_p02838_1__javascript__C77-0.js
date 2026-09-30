function Main(input) {
  input = input.split('\n');
  const n = parseInt(input[0], 10);
  const values = input[1].split(' ');
  const high = new Array(n);
  let sum = 0;
  let carry = 0;
  const mod = 1000000007;

  for (let i = 0; i < n; i++) {
    values[i] = parseInt(values[i], 10);
    high[i] = Math.floor(values[i] / 100000000);
    values[i] = values[i] % 100000000;
  }

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      sum += values[i] ^ values[j];
      if (sum > 100000000 / 2) {
        sum = sum % (100000000 / 2);
        carry += 0.5;
      }
      carry += high[i] ^ high[j];
    }
  }

  sum = sum + carry / 100000000;
  console.log(sum % mod);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
