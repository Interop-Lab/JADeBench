function Main(input) {
  const lines = input.split('\n');
  const n = parseInt(lines[0], 10);
  const nums = lines[1].split(' ');
  const arr = new Array(n);
  const mods = new Array(n);
  for (let i = 0; i < n; i++) {
    arr[i] = parseInt(nums[i], 10);
    mods[i] = Math.abs(arr[i] % 10);
    arr[i] = arr[i] % 10;
  }
  let sum = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      sum += arr[i] * arr[j];
      if (sum > 1000000007) {
        sum = sum % 1000000007;
        count += 0.5;
      }
      count += mods[i] * mods[j];
    }
  }
  let total = 0;
  sum = sum + count * 1000000007;
  console.log(sum + total);
}

Main(require('fs').readFileSync('input.txt', 'utf8'));
