const main = input => {
  const lines = input.trim().split('\n');
  const n = Number(lines[0]);
  const numbers = lines[1].split(' ').map(Number);

  const prefixSums = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    prefixSums[i] += (prefixSums[i - 1] || 0) + numbers[i];
  }

  const frequencies = {};
  frequencies[0] = 1;

  for (let i = 0; i < n; i++) {
    const sum = prefixSums[i];
    frequencies[sum] = (frequencies[sum] || 0) + 1;
  }

  let zeroSumSubarrayCount = 0;

  Object.keys(frequencies).forEach(sum => {
    const count = frequencies[sum];
    zeroSumSubarrayCount += count * (count - 1) / 2;
  });

  console.log(zeroSumSubarrayCount);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
