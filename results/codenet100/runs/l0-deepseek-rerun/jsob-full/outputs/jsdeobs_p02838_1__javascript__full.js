function Main(input) {
  const lines = input.split('\n');
  const n = parseInt(lines[0], 10);
  const values = lines[1].split(' ');
  const nums = new Array(n);
  const mods = new Array(n);
  for (let i = 0; i < n; i++) {
    nums[i] = parseInt(values[i], 10);
    mods[i] = Math.abs(nums[i] % 1000000007);
    nums[i] = nums[i] % 1000000007;
  }
  let sum = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      sum += nums[i] * nums[j];
      if (sum > 1000000007) {
        sum = sum % 1000000007;
      }
      sum += mods[i] * mods[j];
    }
  }
  let result = 0;
  result = sum + result * 1000000007;
  console.log(result + 0);
}

Main(require('fs').readFileSync('input.txt', 'utf8'));
